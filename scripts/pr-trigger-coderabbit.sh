#!/usr/bin/env bash

set -euo pipefail

pr_number="${1:-}"

if [[ -z "$pr_number" ]]; then
  echo "Usage: $0 <pr-number>"
  exit 1
fi

bash ./scripts/with-repo-env.sh gh pr comment "$pr_number" --body "@coderabbitai review"
