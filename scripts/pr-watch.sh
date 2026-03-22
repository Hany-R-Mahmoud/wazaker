#!/usr/bin/env bash

set -euo pipefail

source ./scripts/lib/github-env.sh

pr_ref="${1:-}"
branch_name="$(git branch --show-current)"
poll_seconds="${POLL_SECONDS:-30}"
max_checks="${MAX_CHECKS:-0}"
review_settle_seconds="${REVIEW_SETTLE_SECONDS:-600}"
require_bot_activity="${REQUIRE_BOT_REVIEW_ACTIVITY:-1}"
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

if (( max_checks <= 0 )); then
  max_checks=$(( (review_settle_seconds + poll_seconds - 1) / poll_seconds + 4 ))
fi

settle_window_start_epoch="$(date +%s)"

count=1
while (( count <= max_checks )); do
  bash ./scripts/pr-refresh-review-artifacts.sh "$pr_view_ref" "$branch_name" >/dev/null

  now_epoch="$(date +%s)"
  seconds_since_watch_start=$(( now_epoch - settle_window_start_epoch ))
  blocking_bot_review_pending="$(jq -r '.blockingBotReviewPending' "$gate_file")"
  bot_activity_seen="$(jq -r '.botActivitySeen' "$gate_file")"

  if jq -e 'length > 0' "$comments_file" >/dev/null 2>&1; then
    echo "Actionable bot review comments detected."
    echo "$pr_json_file"
    exit 0
  fi

  if [[ "$bot_activity_seen" == "true" ]]; then
    if [[ "$blocking_bot_review_pending" == "true" ]]; then
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
    if [[ "$require_bot_activity" == "1" ]]; then
      echo "No bot review activity appeared before the settle window closed. Refusing automatic merge."
      echo "$pr_json_file"
      exit 3
    fi
    echo "No bot review activity after settle window; treating PR as clear of actionable bot comments because REQUIRE_BOT_REVIEW_ACTIVITY=0."
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
