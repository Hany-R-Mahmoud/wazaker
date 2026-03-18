#!/usr/bin/env bash

set -euo pipefail

pr_number="${1:-}"
max_cycles="${MAX_REVIEW_CYCLES:-3}"
poll_seconds="${POLL_SECONDS:-15}"
max_checks="${MAX_CHECKS:-12}"

if [[ -z "$pr_number" ]]; then
  pr_number="$(bash ./scripts/with-repo-env.sh gh pr view --json number -q .number)"
fi

if [[ -z "$pr_number" ]]; then
  echo "Could not determine PR number."
  exit 1
fi

cycle=1
while (( cycle <= max_cycles )); do
  echo "Review cycle $cycle of $max_cycles for PR #$pr_number"

  bash ./scripts/pr-trigger-coderabbit.sh "$pr_number" || true
  POLL_SECONDS="$poll_seconds" MAX_CHECKS="$max_checks" bash ./scripts/pr-watch.sh

  before_head="$(git rev-parse HEAD)"
  bash ./scripts/pr-resolve-review.sh
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
