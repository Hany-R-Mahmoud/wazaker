#!/usr/bin/env bash

set -euo pipefail

manifest=""
provider=""
output_dir=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --manifest)
      manifest="$2"
      shift 2
      ;;
    --provider)
      provider="$2"
      shift 2
      ;;
    --output-dir)
      output_dir="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$manifest" || -z "$provider" || -z "$output_dir" ]]; then
  echo "Usage: $0 --manifest <path> --provider <whisper-cpp> --output-dir <path>" >&2
  exit 1
fi

if [[ "$provider" != "whisper-cpp" ]]; then
  echo "Unsupported local provider: $provider" >&2
  echo "Current supported value: whisper-cpp" >&2
  exit 1
fi

if [[ ! -f "$manifest" ]]; then
  echo "Manifest not found: $manifest" >&2
  exit 1
fi

if [[ -z "${WHISPER_CPP_BIN:-}" || -z "${WHISPER_CPP_MODEL:-}" ]]; then
  cat >&2 <<'EOF'
Missing local whisper.cpp configuration.

Set:
  WHISPER_CPP_BIN=/absolute/path/to/whisper-cli
  WHISPER_CPP_MODEL=/absolute/path/to/ggml-model.bin

Then rerun the command.
EOF
  exit 1
fi

mkdir -p "$output_dir"

python3 - "$manifest" "$output_dir" <<'PY'
import json
import os
import re
import subprocess
import sys
from pathlib import Path

manifest_path = Path(sys.argv[1])
output_dir = Path(sys.argv[2]).resolve()
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
binary = os.environ["WHISPER_CPP_BIN"]
model = os.environ["WHISPER_CPP_MODEL"]
use_gpu = os.environ.get("WHISPER_CPP_USE_GPU", "0") == "1"
extra_args = os.environ.get("WHISPER_CPP_EXTRA_ARGS", "").strip().split()
segment_re = re.compile(r"^\[[^\]]+\]\s+(.*)$")

output_dir.mkdir(parents=True, exist_ok=True)

for sample in manifest.get("samples", []):
    sample_id = sample["sampleId"]
    audio_path = Path(sample["audioPath"]).resolve()
    if not audio_path.exists():
        print(f"Skipping {sample_id}: missing audio file {audio_path}", file=sys.stderr)
        continue

    output_file = output_dir / f"{sample_id}.txt"
    command = [
        binary,
        "-m",
        model,
        "-f",
        str(audio_path),
        "-l",
        "ar",
    ]
    if not use_gpu:
        command.append("--no-gpu")
    if extra_args:
        command.extend(extra_args)

    result = subprocess.run(command, check=True, capture_output=True, text=True)
    transcript_lines = []
    for line in result.stdout.splitlines():
        match = segment_re.match(line.strip())
        if match:
            transcript_lines.append(match.group(1).strip())

    transcript_text = "\n".join(line for line in transcript_lines if line)
    if not transcript_text:
        raise SystemExit(f"No transcript text extracted for {sample_id}")

    output_file.write_text(transcript_text + "\n", encoding="utf-8")
    print(f"Created transcript for {sample_id}: {output_file}")
PY
