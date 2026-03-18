#!/usr/bin/env bash

set -euo pipefail

branch_name="${1:-$(git branch --show-current)}"
safe_branch="${branch_name//\//-}"
output_dir="docs/pr-reviews"
status_file="$output_dir/${safe_branch}-pr-status.json"
comments_file="$output_dir/${safe_branch}-review-comments.json"
prompt_file="${2:-$output_dir/${safe_branch}-review-prompts.md}"

if [[ ! -f "$comments_file" ]]; then
  echo "Missing review artifacts. Run ./scripts/pr-watch.sh first." >&2
  exit 1
fi

python3 - "$status_file" "$comments_file" "$prompt_file" <<'PY'
import json
import re
import sys
from pathlib import Path

status_path = Path(sys.argv[1])
comments_path = Path(sys.argv[2])
output_path = Path(sys.argv[3])

def load_json(path: Path):
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)

comments = load_json(comments_path)

pattern = re.compile(
    r"<summary>🤖 Prompt for (?:all review comments with )?AI [Aa]gents</summary>.*?```(?:\w+)?\n(.*?)```",
    re.DOTALL,
)

sources = []
for item in comments:
    body = item.get("body") or ""
    author = (item.get("user") or {}).get("login") or ""
    path = item.get("path") or ""
    sources.append((author, path, body))

if status_path.exists():
    status = load_json(status_path)
    for item in status.get("comments", []):
        body = item.get("body") or ""
        author = (item.get("author") or {}).get("login") or ""
        sources.append((author, "", body))

prompts = []
seen = set()
for author, path, body in sources:
    for match in pattern.finditer(body):
        prompt = match.group(1).strip()
        if not prompt or prompt in seen:
            continue
        seen.add(prompt)
        prompts.append((author, path, prompt))

if not prompts:
    sys.exit(2)

lines = ["# Extracted Review Prompts", ""]
for idx, (author, path, prompt) in enumerate(prompts, start=1):
    location = f" (`{path}`)" if path else ""
    lines.append(f"## Prompt {idx} from `{author}`{location}")
    lines.append("")
    lines.append("```text")
    lines.append(prompt)
    lines.append("```")
    lines.append("")

output_path.parent.mkdir(parents=True, exist_ok=True)
output_path.write_text("\n".join(lines), encoding="utf-8")
print(str(output_path))
PY
