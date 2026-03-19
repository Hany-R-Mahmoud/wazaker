#!/usr/bin/env bash

set -euo pipefail

source ./scripts/lib/github-env.sh

pr_number="${1:-}"
max_cycles="${MAX_REVIEW_CYCLES:-3}"
poll_seconds="${POLL_SECONDS:-15}"
review_settle_seconds="${REVIEW_SETTLE_SECONDS:-600}"
max_checks="${MAX_CHECKS:-0}"
max_coderabbit_trigger_comments="${MAX_CODERABBIT_TRIGGER_COMMENTS:-4}"
max_bot_review_timeouts="${MAX_BOT_REVIEW_TIMEOUTS:-2}"

if [[ -z "$pr_number" ]]; then
  pr_number="$(bash ./scripts/with-github-env.sh gh pr view --json number -q .number)"
fi

if [[ -z "$pr_number" ]]; then
  echo "Could not determine PR number."
  exit 1
fi

if (( max_checks <= 0 )); then
  max_checks=$(( (review_settle_seconds + poll_seconds - 1) / poll_seconds + 2 ))
fi

branch_name="$(git branch --show-current)"
safe_branch="${branch_name//\//-}"
output_dir="docs/pr-reviews"
state_file="$output_dir/${safe_branch}-review-loop-state.json"

mkdir -p "$output_dir"

node ./scripts/lib/pr-review-loop-budget.mjs "$state_file" ensure "$(jq -nc \
  --argjson prNumber "$pr_number" \
  --arg branchName "$branch_name" \
  --argjson maxTriggerComments "$max_coderabbit_trigger_comments" \
  --argjson maxWatchTimeouts "$max_bot_review_timeouts" \
  '{prNumber: $prNumber, branchName: $branchName, maxTriggerComments: $maxTriggerComments, maxWatchTimeouts: $maxWatchTimeouts}')" >/dev/null

cycle=1
while (( cycle <= max_cycles )); do
  echo "Review cycle $cycle of $max_cycles for PR #$pr_number"

  current_trigger_count="$(node ./scripts/lib/pr-review-loop-budget.mjs "$state_file" show | jq -r '.triggerCommentCount')"
  if (( current_trigger_count >= max_coderabbit_trigger_comments )); then
    node ./scripts/lib/pr-review-loop-budget.mjs "$state_file" event blocked "$(jq -nc \
      --arg reason "Reached CodeRabbit retrigger budget (${current_trigger_count}/${max_coderabbit_trigger_comments}). Stop automatic retries and inspect the PR manually." \
      --argjson cycle "$cycle" \
      '{reason: $reason, cycle: $cycle}')" >/dev/null
    echo "Reached CodeRabbit retrigger budget (${current_trigger_count}/${max_coderabbit_trigger_comments}). Stopping automatic review retries."
    exit 78
  fi

  trigger_status=0
  if ! trigger_output="$(bash ./scripts/pr-trigger-coderabbit.sh "$pr_number" 2>&1)"; then
    trigger_status=$?
  fi
  if [[ -n "$trigger_output" ]]; then
    echo "$trigger_output"
  fi
  if (( trigger_status != 0 )); then
    exit "$trigger_status"
  fi
  trigger_comment_url="$(printf '%s\n' "$trigger_output" | tail -n 1)"
  node ./scripts/lib/pr-review-loop-budget.mjs "$state_file" event trigger "$(jq -nc \
    --argjson cycle "$cycle" \
    --arg url "$trigger_comment_url" \
    '{cycle: $cycle, url: $url}')" >/dev/null

  watch_output=""
  watch_status=0
  if ! watch_output="$(POLL_SECONDS="$poll_seconds" MAX_CHECKS="$max_checks" REVIEW_SETTLE_SECONDS="$review_settle_seconds" bash ./scripts/pr-watch.sh "$pr_number" 2>&1)"; then
    watch_status=$?
  fi
  if [[ -n "$watch_output" ]]; then
    echo "$watch_output"
  fi

  case "$watch_status" in
    0)
      if grep -q "Actionable bot review comments detected." <<< "$watch_output"; then
        node ./scripts/lib/pr-review-loop-budget.mjs "$state_file" event watch-actionable "$(jq -nc --argjson cycle "$cycle" '{cycle: $cycle}')" >/dev/null
      elif grep -q "Bot review completed with no actionable bot comments after settle window." <<< "$watch_output"; then
        node ./scripts/lib/pr-review-loop-budget.mjs "$state_file" event watch-settled "$(jq -nc --argjson cycle "$cycle" '{cycle: $cycle}')" >/dev/null
      fi
      ;;
    2)
      node ./scripts/lib/pr-review-loop-budget.mjs "$state_file" event watch-timeout "$(jq -nc --argjson cycle "$cycle" '{cycle: $cycle}')" >/dev/null
      timeout_count="$(node ./scripts/lib/pr-review-loop-budget.mjs "$state_file" show | jq -r '.watchTimeoutCount')"
      if (( timeout_count >= max_bot_review_timeouts )); then
        node ./scripts/lib/pr-review-loop-budget.mjs "$state_file" event blocked "$(jq -nc \
          --arg reason "CodeRabbit timed out or stayed in review-in-progress state too many times (${timeout_count}/${max_bot_review_timeouts}). Pause automation and inspect manually." \
          --argjson cycle "$cycle" \
          '{reason: $reason, cycle: $cycle}')" >/dev/null
      else
        node ./scripts/lib/pr-review-loop-budget.mjs "$state_file" event blocked "$(jq -nc \
          --arg reason "Timed out waiting for CodeRabbit review on cycle ${cycle}. Stopping this run early to avoid a loop; review budget remaining before manual escalation: $(( max_bot_review_timeouts - timeout_count ))." \
          --argjson cycle "$cycle" \
          '{reason: $reason, cycle: $cycle}')" >/dev/null
      fi
      echo "Timed out waiting for CodeRabbit review. Stopping this run to avoid an endless loop."
      exit 78
      ;;
    3)
      node ./scripts/lib/pr-review-loop-budget.mjs "$state_file" event blocked "$(jq -nc \
        --arg reason "No bot review activity appeared before the settle window closed. Stop the loop and inspect the GitHub App state manually." \
        --argjson cycle "$cycle" \
        '{reason: $reason, cycle: $cycle}')" >/dev/null
      echo "No bot review activity appeared before the settle window closed. Stopping this run."
      exit 78
      ;;
    *)
      exit "$watch_status"
      ;;
  esac

  before_head="$(git rev-parse HEAD)"
  if bash ./scripts/pr-resolve-review.sh; then
    :
  else
    resolver_status=$?
    if (( resolver_status == 75 )); then
      echo "Review loop paused because Codex usage limits blocked the resolver pass."
      exit 75
    fi
    exit "$resolver_status"
  fi
  after_head="$(git rev-parse HEAD)"

  bash ./scripts/pr-thread-sync.sh "$pr_number" "$branch_name" || true

  if [[ "$before_head" == "$after_head" ]]; then
    echo "No new changes were committed while resolving review feedback."
    if bash ./scripts/pr-check-unresolved.sh "$pr_number" "$branch_name"; then
      node ./scripts/lib/pr-review-loop-budget.mjs "$state_file" event clear "$(jq -nc --argjson cycle "$cycle" '{cycle: $cycle}')" >/dev/null
      break
    fi
    echo "Actionable review comments still remain after a no-op resolver pass."
    node ./scripts/lib/pr-review-loop-budget.mjs "$state_file" event blocked "$(jq -nc \
      --arg reason "Actionable review comments still remained after a no-op resolver pass. Stop automatic retries and inspect manually." \
      --argjson cycle "$cycle" \
      '{reason: $reason, cycle: $cycle}')" >/dev/null
    exit 78
  fi

  cycle=$((cycle + 1))
done

echo "Review loop finished for PR #$pr_number"
if bash ./scripts/pr-check-unresolved.sh "$pr_number" "$branch_name"; then
  node ./scripts/lib/pr-review-loop-budget.mjs "$state_file" event clear "$(jq -nc '{result: "clear_to_merge"}')" >/dev/null
  echo "PR review threads are clean. Merge with: bash ./scripts/pr-merge.sh"
else
  echo "PR still has unresolved review threads. Re-run the review cycle before merging."
fi
