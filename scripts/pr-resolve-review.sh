#!/usr/bin/env bash

set -euo pipefail

branch_name="$(git branch --show-current)"
safe_branch="${branch_name//\//-}"
output_dir="docs/pr-reviews"
status_file="$output_dir/${safe_branch}-pr-status.json"
comments_file="$output_dir/${safe_branch}-review-comments.json"
prompts_file="$output_dir/${safe_branch}-review-prompts.md"

if [[ ! -f "$status_file" || ! -f "$comments_file" ]]; then
  echo "Missing review artifacts. Run ./scripts/pr-watch.sh first."
  exit 1
fi

has_actionable_comments() {
  local actionable_review_comments
  local actionable_status_comments

  actionable_review_comments="$(jq '
    [
      .[]?
      | select(
          ((.body // "") | test("!\\[P[0-3] Badge\\]|Inline comments:|Nitpick comments:"; "i"))
        )
    ] | length
  ' "$comments_file")"

  actionable_status_comments="$(jq '
    [
      .comments[]?
      | select(
          ((.author.login // "") | ascii_downcase | contains("coderabbit"))
          and ((.body // "") | test("!\\[P[0-3] Badge\\]|Inline comments:|Nitpick comments:"; "i"))
        )
    ] | length
  ' "$status_file")"

  if (( actionable_review_comments > 0 || actionable_status_comments > 0 )); then
    return 0
  fi

  return 1
}

if ! has_actionable_comments; then
  echo "No actionable review findings detected in saved artifacts."
  exit 0
fi

has_extracted_prompts=false
if bash ./scripts/pr-extract-review-prompts.sh "$branch_name" "$prompts_file" >/dev/null 2>&1; then
  has_extracted_prompts=true
fi

prompt_file="$(mktemp)"
cat > "$prompt_file" <<EOF
You are resolving pull request review feedback for the current repository.

Review status JSON:
$status_file

Review comments JSON:
$comments_file

Extracted review prompts:
$prompts_file

Tasks:
1. Read the review artifacts.
2. If the extracted review prompts file exists and contains review prompts, use those prompts as the primary fix instructions.
3. Apply the smallest coherent fixes needed for valid review findings.
4. Do not change unrelated behavior.
5. Run lightweight validation if relevant.
6. Summarize what was fixed and what remains uncertain.
EOF

if [[ "$has_extracted_prompts" == false ]]; then
  cat >> "$prompt_file" <<EOF

Note:
- No explicit "Prompt for AI Agents" blocks were extracted from the review artifacts.
- Infer the actionable fixes directly from the review comments.
EOF
fi

codex exec --full-auto -C "$(pwd)" "$(cat "$prompt_file")"

rm -f "$prompt_file"

if [[ -n "$(git status --porcelain)" ]]; then
  git add .
  git commit -m "fix: address pr review feedback"
  git push
else
  echo "No changes produced while resolving review feedback."
fi
