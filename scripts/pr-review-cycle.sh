#!/usr/bin/env bash

set -euo pipefail

source ./scripts/lib/github-env.sh

pr_number="${1:-}"
max_cycles="${MAX_REVIEW_CYCLES:-3}"
poll_seconds="${POLL_SECONDS:-15}"
review_settle_seconds="${REVIEW_SETTLE_SECONDS:-240}"
max_checks="${MAX_CHECKS:-0}"

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

cycle=1
while (( cycle <= max_cycles )); do
  echo "Review cycle $cycle of $max_cycles for PR #$pr_number"

  bash ./scripts/pr-trigger-coderabbit.sh "$pr_number" || true
  POLL_SECONDS="$poll_seconds" MAX_CHECKS="$max_checks" REVIEW_SETTLE_SECONDS="$review_settle_seconds" bash ./scripts/pr-watch.sh "$pr_number"

  before_head="$(git rev-parse HEAD)"
  resolver_status=0
  if ! bash ./scripts/pr-resolve-review.sh; then
    resolver_status=$?
    if (( resolver_status == 75 )); then
      echo "Review loop paused because Codex usage limits blocked the resolver pass."
      exit 75
    fi
    exit "$resolver_status"
  fi
  after_head="$(git rev-parse HEAD)"

  bash ./scripts/pr-thread-sync.sh "$pr_number" "$(git branch --show-current)" || true

  if [[ "$before_head" == "$after_head" ]]; then
    echo "No new changes were committed while resolving review feedback."
    if bash ./scripts/pr-check-unresolved.sh "$pr_number" "$(git branch --show-current)"; then
      break
    fi
    echo "Actionable review comments still remain after a no-op resolver pass."
    break
  fi

  cycle=$((cycle + 1))
done

echo "Review loop finished for PR #$pr_number"
if bash ./scripts/pr-check-unresolved.sh "$pr_number" "$(git branch --show-current)"; then
  echo "PR review threads are clean. Merge with: bash ./scripts/pr-merge.sh"
else
  echo "PR still has unresolved review threads. Re-run the review cycle before merging."
fi
