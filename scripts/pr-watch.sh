#!/usr/bin/env bash

set -euo pipefail

if ! bash ./scripts/with-repo-env.sh gh auth status >/dev/null 2>&1; then
  echo "gh is not authenticated cleanly. Cannot poll PR review state."
  exit 1
fi

pr_ref="${1:-}"
branch_name="$(git branch --show-current)"
poll_seconds="${POLL_SECONDS:-30}"
max_checks="${MAX_CHECKS:-20}"
review_settle_seconds="${REVIEW_SETTLE_SECONDS:-240}"
output_dir="docs/pr-reviews"
safe_branch="${branch_name//\//-}"

mkdir -p "$output_dir"

pr_json_file="$output_dir/${safe_branch}-pr-status.json"
comments_file="$output_dir/${safe_branch}-review-comments.json"
raw_comments_file="$output_dir/${safe_branch}-review-comments.raw.json"

if [[ -n "$pr_ref" && "$pr_ref" =~ ^[0-9]+$ ]]; then
  pr_view_ref="$pr_ref"
else
  pr_view_ref="${pr_ref:-$branch_name}"
fi

settle_window_start_epoch="$(date +%s)"

count=1
while (( count <= max_checks )); do
  bash ./scripts/with-repo-env.sh gh pr view "$pr_view_ref" \
    --json number,url,title,reviewDecision,latestReviews,reviews,comments,statusCheckRollup,mergeStateStatus \
    > "$pr_json_file"

  npx agent-reviews --pr "$(jq -r '.number' "$pr_json_file")" --unresolved --bots-only --json > "$raw_comments_file"
  python3 ./scripts/pr-filter-agent-reviews.py "$raw_comments_file" "$comments_file" >/dev/null

  now_epoch="$(date +%s)"
  seconds_since_watch_start=$(( now_epoch - settle_window_start_epoch ))

  if jq -e 'length > 0' "$comments_file" >/dev/null 2>&1; then
    echo "Actionable bot review comments detected."
    echo "$pr_json_file"
    exit 0
  fi

  if jq -e '
    (
      [
        .latestReviews[]?.author.login // empty,
        .reviews[]?.author.login // empty,
        .comments[]?.author.login // empty
      ] | map(ascii_downcase | contains("coderabbit"))
    ) | any
  ' "$pr_json_file" >/dev/null 2>&1; then
    if jq -e '
      [
        .comments[]?
        | select((.author.login // "" | ascii_downcase | contains("coderabbit")))
        | (.body // "" | ascii_downcase)
      ]
      | if length == 0 then false else .[-1] | contains("review in progress") end
    ' "$pr_json_file" >/dev/null 2>&1; then
      echo "Bot review still in progress; waiting."
    else
      if (( seconds_since_watch_start >= review_settle_seconds )); then
        echo "Bot review completed with no actionable bot comments after settle window."
        echo "$pr_json_file"
        exit 0
      fi
      echo "Bot review seen, but settle window is still open (${seconds_since_watch_start}s/${review_settle_seconds}s). Waiting."
    fi
  elif (( seconds_since_watch_start >= review_settle_seconds )); then
    echo "No bot review activity after settle window; treating PR as clear of actionable bot comments."
    echo "$pr_json_file"
    exit 0
  else
    echo "No actionable bot review comments yet; settle window is still open (${seconds_since_watch_start}s/${review_settle_seconds}s). Waiting."
  fi

  sleep "$poll_seconds"
  count=$((count + 1))
done

echo "Timed out waiting for CodeRabbit review."
echo "$pr_json_file"
exit 2
