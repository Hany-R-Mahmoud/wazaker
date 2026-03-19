#!/usr/bin/env bash

set -euo pipefail

pr_number="${1:-}"
body_file="${2:-}"

if [[ -z "$pr_number" || -z "$body_file" ]]; then
  echo "Usage: $0 <pr-number> <body-file>" >&2
  exit 1
fi

if [[ ! -f "$body_file" ]]; then
  echo "Comment body file not found: $body_file" >&2
  exit 1
fi

bash ./scripts/with-repo-env.sh gh pr comment "$pr_number" --body-file "$body_file"
