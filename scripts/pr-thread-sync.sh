#!/usr/bin/env bash

set -euo pipefail

source ./scripts/lib/github-env.sh

pr_number="${1:-}"
branch_name="${2:-$(git branch --show-current)}"
safe_branch="${branch_name//\//-}"
output_dir="docs/pr-reviews"
reply_template_file="${PR_THREAD_REPLY_TEMPLATE_FILE:-}"
comments_file="$output_dir/${safe_branch}-review-comments.json"

mkdir -p "$output_dir"

if [[ -z "$pr_number" ]]; then
  pr_number="$(bash ./scripts/with-github-env.sh gh pr view --json number -q .number)"
fi

if [[ -z "$pr_number" ]]; then
  echo "Could not determine PR number."
  exit 1
fi

if [[ ! -f "$comments_file" ]]; then
  echo "Missing filtered review comments. Run ./scripts/pr-watch.sh first."
  exit 0
fi

head_sha="$(git rev-parse --short HEAD)"
default_reply="Addressed on branch \`$(git branch --show-current)\` in commit \`${head_sha}\`. Resolving this thread automatically; reopen it if anything is still outstanding."

if [[ -n "$reply_template_file" && -f "$reply_template_file" ]]; then
  reply_body="$(cat "$reply_template_file")"
else
  reply_body="$default_reply"
fi

synced_count=0

while IFS= read -r comment_id; do
  if [[ -z "$comment_id" ]]; then
    continue
  fi

  npx agent-reviews --pr "$pr_number" --reply "$comment_id" "$reply_body" --resolve >/dev/null
  synced_count=$((synced_count + 1))
done < <(jq -r '
  .[]?
  | select(.hasHumanReply != true)
  | .id
' "$comments_file")

echo "Resolved bot threads: $synced_count"
