#!/usr/bin/env python3
"""Filter agent-reviews output down to actionable bot review comments."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any


STATUS_PATTERNS = [
    re.compile(r"<summary>✅ Actions performed</summary>", re.IGNORECASE),
    re.compile(r"\bReview triggered\b", re.IGNORECASE),
    re.compile(r"\breview in progress\b", re.IGNORECASE),
]

ACTIONABLE_PATTERNS = [
    re.compile(r"Prompt for (?:all review comments with )?AI Agents", re.IGNORECASE),
    re.compile(r"Nitpick comments:", re.IGNORECASE),
    re.compile(r"Inline comments:", re.IGNORECASE),
    re.compile(r"!\[P[0-3] Badge\]", re.IGNORECASE),
]


def is_status_noise(comment: dict[str, Any]) -> bool:
    body = comment.get("body") or ""
    if any(pattern.search(body) for pattern in STATUS_PATTERNS):
        return True
    return comment.get("type") == "issue_comment" and not (comment.get("path") or comment.get("line"))


def is_actionable(comment: dict[str, Any]) -> bool:
    body = comment.get("body") or ""
    if comment.get("path") or comment.get("line"):
        return True
    return any(pattern.search(body) for pattern in ACTIONABLE_PATTERNS)


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: pr-filter-agent-reviews.py <input-json> <output-json>", file=sys.stderr)
        return 1

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    if not input_path.exists():
        print(f"Input file not found: {input_path}", file=sys.stderr)
        return 1

    data = json.loads(input_path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        print("Expected agent-reviews JSON array.", file=sys.stderr)
        return 1

    filtered = [comment for comment in data if not is_status_noise(comment) and is_actionable(comment)]

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(filtered, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(str(output_path))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
