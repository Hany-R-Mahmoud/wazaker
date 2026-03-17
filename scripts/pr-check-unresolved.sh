#!/usr/bin/env bash

set -euo pipefail

pr_number="${1:-}"
branch_name="${2:-$(git branch --show-current)}"
safe_branch="${branch_name//\//-}"
output_dir="docs/pr-reviews"
threads_file="$output_dir/${safe_branch}-review-threads.json"

if [[ -z "$pr_number" ]]; then
  pr_number="$(bash ./scripts/with-repo-env.sh gh pr view --json number -q .number)"
fi

if [[ -z "$pr_number" ]]; then
  echo "Could not determine PR number."
  exit 1
fi

bash ./scripts/pr-thread-sync.sh "$pr_number" "$branch_name" >/dev/null

human_open_count="$(jq '
  [
    .data.repository.pullRequest.reviewThreads.nodes[]?
    | select(.isResolved == false)
    | .comments.nodes[-1].author.login // ""
    | ascii_downcase
    | select((contains("coderabbit") or contains("chatgpt-codex-connector")) | not)
  ] | length
' "$threads_file")"

bot_open_count="$(jq '
  [
    .data.repository.pullRequest.reviewThreads.nodes[]?
    | select(.isResolved == false)
    | .comments.nodes[-1].author.login // ""
    | ascii_downcase
    | select(contains("coderabbit") or contains("chatgpt-codex-connector"))
  ] | length
' "$threads_file")"

echo "Unresolved human threads: $human_open_count"
echo "Unresolved bot threads: $bot_open_count"

if [[ "$human_open_count" != "0" || "$bot_open_count" != "0" ]]; then
  exit 2
fi
