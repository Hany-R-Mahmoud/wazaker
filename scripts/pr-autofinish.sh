#!/usr/bin/env bash

set -euo pipefail

source ./scripts/lib/github-env.sh

pr_number="${1:-}"

if [[ -z "$pr_number" ]]; then
  pr_number="$(bash ./scripts/with-github-env.sh gh pr view --json number -q .number)"
fi

if [[ -z "$pr_number" ]]; then
  echo "Could not determine PR number."
  exit 1
fi

review_cycle_status=0
if ! bash ./scripts/pr-review-cycle.sh "$pr_number"; then
  review_cycle_status=$?
  if (( review_cycle_status == 78 )); then
    echo "PR autofinish paused because the bot-review budget was exhausted or manual inspection is required."
  fi
  exit "$review_cycle_status"
fi
bash ./scripts/pr-merge.sh "$pr_number"
