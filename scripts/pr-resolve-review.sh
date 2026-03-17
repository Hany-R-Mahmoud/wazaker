#!/usr/bin/env bash

set -euo pipefail

branch_name="$(git branch --show-current)"
safe_branch="${branch_name//\//-}"
output_dir="docs/pr-reviews"
status_file="$output_dir/${safe_branch}-pr-status.json"
comments_file="$output_dir/${safe_branch}-review-comments.json"

if [[ ! -f "$status_file" || ! -f "$comments_file" ]]; then
  echo "Missing review artifacts. Run ./scripts/pr-watch.sh first."
  exit 1
fi

prompt_file="$(mktemp)"
cat > "$prompt_file" <<EOF
You are resolving pull request review feedback for the current repository.

Review status JSON:
$status_file

Review comments JSON:
$comments_file

Tasks:
1. Read the review artifacts.
2. Apply the smallest coherent fixes needed for valid review findings.
3. Do not change unrelated behavior.
4. Run lightweight validation if relevant.
5. Summarize what was fixed and what remains uncertain.
EOF

codex exec --full-auto -C "$(pwd)" "$(cat "$prompt_file")"

rm -f "$prompt_file"

if [[ -n "$(git status --porcelain)" ]]; then
  git add .
  git commit -m "fix: address pr review feedback"
  git push
else
  echo "No changes produced while resolving review feedback."
fi
