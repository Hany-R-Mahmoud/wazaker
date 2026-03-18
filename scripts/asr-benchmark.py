#!/usr/bin/env python3
"""Score local ASR transcript outputs against expected Quran text fixtures."""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any


PUNCT_TRANSLATION = str.maketrans("", "", ".,;:!?\"'()[]{}<>/\\|`~@#$%^&*_+=،؛؟ـ")
ARABIC_DIACRITICS = re.compile(r"[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]")
WHITESPACE_RE = re.compile(r"\s+")


@dataclass
class SampleResult:
    sample_id: str
    passage_label: str
    word_error_rate: float
    expected_tokens: int
    observed_tokens: int
    missing_tokens: list[str]
    inserted_tokens: list[str]
    substitutions: int


def normalize_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKC", text)
    normalized = normalized.translate(PUNCT_TRANSLATION)
    normalized = ARABIC_DIACRITICS.sub("", normalized)
    normalized = normalized.replace("آ", "ا").replace("أ", "ا").replace("إ", "ا")
    normalized = normalized.replace("ى", "ي").replace("ة", "ه")
    normalized = normalized.replace("ؤ", "و").replace("ئ", "ي")
    normalized = WHITESPACE_RE.sub(" ", normalized).strip()
    return normalized


def levenshtein(tokens_a: list[str], tokens_b: list[str]) -> tuple[int, int, int, int]:
    rows = len(tokens_a) + 1
    cols = len(tokens_b) + 1
    dp = [[0] * cols for _ in range(rows)]

    for i in range(rows):
      dp[i][0] = i
    for j in range(cols):
      dp[0][j] = j

    for i in range(1, rows):
        for j in range(1, cols):
            cost = 0 if tokens_a[i - 1] == tokens_b[j - 1] else 1
            dp[i][j] = min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost,
            )

    i = len(tokens_a)
    j = len(tokens_b)
    substitutions = 0
    deletions = 0
    insertions = 0

    while i > 0 or j > 0:
        if i > 0 and dp[i][j] == dp[i - 1][j] + 1:
            deletions += 1
            i -= 1
        elif j > 0 and dp[i][j] == dp[i][j - 1] + 1:
            insertions += 1
            j -= 1
        else:
            if i > 0 and j > 0 and tokens_a[i - 1] != tokens_b[j - 1]:
                substitutions += 1
            i -= 1
            j -= 1

    return dp[-1][-1], deletions, insertions, substitutions


def read_transcript_text(path: Path) -> str:
    raw = path.read_text(encoding="utf-8").strip()
    if not raw:
        return ""
    if path.suffix.lower() == ".json":
        data = json.loads(raw)
        if isinstance(data, dict):
            for key in ("text", "transcript", "result"):
                value = data.get(key)
                if isinstance(value, str):
                    return value
        raise ValueError(f"Unsupported transcript JSON schema in {path}")
    return raw


def resolve_transcript_path(transcript_dir: Path, sample_id: str) -> Path:
    candidates = [
        transcript_dir / f"{sample_id}.txt",
        transcript_dir / f"{sample_id}.json",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    raise FileNotFoundError(f"No transcript found for {sample_id} in {transcript_dir}")


def analyze_sample(sample: dict[str, Any], transcript_dir: Path) -> SampleResult:
    transcript_path = resolve_transcript_path(transcript_dir, sample["sampleId"])
    observed = normalize_text(read_transcript_text(transcript_path))
    expected = normalize_text(sample["expectedText"])

    expected_tokens = expected.split() if expected else []
    observed_tokens = observed.split() if observed else []
    distance, _, _, substitutions = levenshtein(expected_tokens, observed_tokens)
    wer = distance / max(1, len(expected_tokens))

    expected_counter = Counter(expected_tokens)
    observed_counter = Counter(observed_tokens)
    missing_tokens = sorted((expected_counter - observed_counter).elements())
    inserted_tokens = sorted((observed_counter - expected_counter).elements())

    return SampleResult(
        sample_id=sample["sampleId"],
        passage_label=sample["passageLabel"],
        word_error_rate=wer,
        expected_tokens=len(expected_tokens),
        observed_tokens=len(observed_tokens),
        missing_tokens=missing_tokens,
        inserted_tokens=inserted_tokens,
        substitutions=substitutions,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Benchmark local ASR transcripts against expected text.")
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--transcript-dir", required=True, type=Path)
    parser.add_argument("--provider", required=True)
    parser.add_argument("--output-json", required=True, type=Path)
    parser.add_argument("--output-md", required=True, type=Path)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    transcript_dir = args.transcript_dir.resolve()
    output_json = args.output_json.resolve()
    output_md = args.output_md.resolve()
    samples = manifest.get("samples", [])
    if not samples:
        raise SystemExit("Manifest contains no samples")

    results = [analyze_sample(sample, transcript_dir) for sample in samples]
    average_wer = sum(item.word_error_rate for item in results) / len(results)

    json_payload = {
        "provider": args.provider,
        "sampleCount": len(results),
        "averageWordErrorRate": average_wer,
        "samples": [
            {
                "sampleId": item.sample_id,
                "passageLabel": item.passage_label,
                "wordErrorRate": round(item.word_error_rate, 4),
                "expectedTokens": item.expected_tokens,
                "observedTokens": item.observed_tokens,
                "missingTokens": item.missing_tokens,
                "insertedTokens": item.inserted_tokens,
                "substitutions": item.substitutions,
            }
            for item in results
        ],
    }

    output_json.parent.mkdir(parents=True, exist_ok=True)
    output_json.write_text(json.dumps(json_payload, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = [
        f"# Local ASR Benchmark Results: {args.provider}",
        "",
        f"- Sample count: {len(results)}",
        f"- Average normalized WER: {average_wer:.3f}",
        "",
        "| Sample | Passage | WER | Missing | Inserted | Substitutions |",
        "|---|---|---:|---:|---:|---:|",
    ]
    for item in results:
        lines.append(
            f"| {item.sample_id} | {item.passage_label} | {item.word_error_rate:.3f} | "
            f"{len(item.missing_tokens)} | {len(item.inserted_tokens)} | {item.substitutions} |"
        )
    output_md.parent.mkdir(parents=True, exist_ok=True)
    output_md.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"Wrote {output_json}")
    print(f"Wrote {output_md}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
