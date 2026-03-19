#!/usr/bin/env bash

set -euo pipefail

branch_name="$(git branch --show-current)"
safe_branch="${branch_name//\//-}"
output_dir="docs/pr-reviews"
status_file="$output_dir/${safe_branch}-pr-status.json"
comments_file="$output_dir/${safe_branch}-review-comments.json"
prompts_file="$output_dir/${safe_branch}-review-prompts.md"

if [[ ! -f "$comments_file" ]]; then
  echo "Missing review artifacts. Run ./scripts/pr-watch.sh first."
  exit 1
fi

has_actionable_comments() {
  jq -e 'length > 0' "$comments_file" >/dev/null 2>&1
}

if ! has_actionable_comments; then
  echo "No actionable review findings detected in saved artifacts."
  exit 0
fi

has_extracted_prompts=false
if bash ./scripts/pr-extract-review-prompts.sh "$branch_name" "$prompts_file" >/dev/null 2>&1; then
  has_extracted_prompts=true
fi

resolver_status_file="$output_dir/${safe_branch}-resolver-status.md"
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

codex_output_file="$(mktemp)"
resolver_exit_code=0
if codex exec --full-auto -C "$(pwd)" "$(cat "$prompt_file")" >"$codex_output_file" 2>&1; then
  :
else
  resolver_exit_code=$?
fi

if (( resolver_exit_code != 0 )); then
  timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  codex_output="$(cat "$codex_output_file")"
  if grep -Eqi 'usage limit|usage limits|dashboard/usage' "$codex_output_file"; then
    cat > "$resolver_status_file" <<EOF
# PR Resolver Status

Generated: $timestamp
Branch: $branch_name
Status: blocked
Reason: Codex usage limit interrupted the automated review-resolver pass.

## Next Step

- Wait for Codex quota recovery or rerun the resolver from a human-supervised session.
- Do not merge until the unresolved review loop is re-run cleanly.

## Codex Output

\`\`\`
$codex_output
\`\`\`
EOF
    echo "Codex usage limits blocked the automated resolver pass. See $resolver_status_file"
    rm -f "$prompt_file" "$codex_output_file"
    exit 75
  fi

  cat > "$resolver_status_file" <<EOF
# PR Resolver Status

Generated: $timestamp
Branch: $branch_name
Status: failed
Reason: Codex exited non-zero while attempting to resolve review feedback.

## Codex Output

\`\`\`
$codex_output
\`\`\`
EOF
  cat "$codex_output_file" >&2
  rm -f "$prompt_file" "$codex_output_file"
  exit "$resolver_exit_code"
fi

rm -f "$prompt_file" "$codex_output_file"

if [[ -n "$(git status --porcelain)" ]]; then
  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "fix: address pr review feedback"
    git push
  else
    echo "No staged source changes produced while resolving review feedback."
  fi
else
  echo "No changes produced while resolving review feedback."
fi
