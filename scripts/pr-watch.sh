#!/usr/bin/env bash

set -euo pipefail

if ! bash ./scripts/with-repo-env.sh gh auth status >/dev/null 2>&1; then
  echo "gh is not authenticated cleanly. Cannot poll PR review state."
  exit 1
fi

branch_name="${1:-$(git branch --show-current)}"
poll_seconds="${POLL_SECONDS:-30}"
max_checks="${MAX_CHECKS:-20}"
output_dir="docs/pr-reviews"
safe_branch="${branch_name//\//-}"

mkdir -p "$output_dir"

pr_json_file="$output_dir/${safe_branch}-pr-status.json"
comments_file="$output_dir/${safe_branch}-review-comments.json"

count=1
while (( count <= max_checks )); do
  bash ./scripts/with-repo-env.sh gh pr view "$branch_name" \
    --json number,url,title,reviewDecision,latestReviews,reviews,comments,statusCheckRollup,mergeStateStatus \
    > "$pr_json_file"

  bash ./scripts/with-repo-env.sh gh api "repos/{owner}/{repo}/pulls/$(jq -r '.number' "$pr_json_file")/comments" > "$comments_file"

  if jq -e '
    (
      [
        .latestReviews[]?.author.login // empty,
        .reviews[]?.author.login // empty,
        .comments[]?.author.login // empty
      ] | map(ascii_downcase | contains("coderabbit"))
    ) | any
  ' "$pr_json_file" >/dev/null 2>&1; then
    echo "CodeRabbit review detected."
    echo "$pr_json_file"
    exit 0
  fi

  sleep "$poll_seconds"
  count=$((count + 1))
done

echo "Timed out waiting for CodeRabbit review."
echo "$pr_json_file"
exit 2
