#!/usr/bin/env bash

set -euo pipefail

pr_number="${1:-}"

if [[ -z "$pr_number" ]]; then
  pr_number="$(bash ./scripts/with-repo-env.sh gh pr view --json number -q .number)"
fi

if [[ -z "$pr_number" ]]; then
  echo "Could not determine PR number."
  exit 1
fi

bash ./scripts/pr-review-cycle.sh "$pr_number"
bash ./scripts/pr-merge.sh
