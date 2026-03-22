#!/usr/bin/env bash

set -euo pipefail

source ./scripts/lib/github-env.sh

pr_ref="${1:-}"
branch_name="${2:-$(git branch --show-current)}"
output_dir="docs/pr-reviews"
safe_branch="${branch_name//\//-}"

mkdir -p "$output_dir"

pr_json_file="$output_dir/${safe_branch}-pr-status.json"
comments_file="$output_dir/${safe_branch}-review-comments.json"
raw_comments_file="$output_dir/${safe_branch}-review-comments.raw.json"
gate_file="$output_dir/${safe_branch}-review-gate.json"

if [[ -n "$pr_ref" && "$pr_ref" =~ ^[0-9]+$ ]]; then
  pr_view_ref="$pr_ref"
else
  pr_view_ref="${pr_ref:-$branch_name}"
fi

bash ./scripts/with-github-env.sh gh pr view "$pr_view_ref" \
  --json number,url,title,reviewDecision,latestReviews,reviews,comments,statusCheckRollup,mergeStateStatus \
  > "$pr_json_file"

npx agent-reviews --pr "$(jq -r '.number' "$pr_json_file")" --unresolved --bots-only --json > "$raw_comments_file"
python3 ./scripts/pr-filter-agent-reviews.py "$raw_comments_file" "$comments_file" >/dev/null
node ./scripts/pr-review-gate.mjs "$pr_json_file" "$comments_file" > "$gate_file"

echo "$pr_json_file"
