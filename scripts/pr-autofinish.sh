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

bash ./scripts/pr-review-cycle.sh "$pr_number"
bash ./scripts/pr-merge.sh "$pr_number"
