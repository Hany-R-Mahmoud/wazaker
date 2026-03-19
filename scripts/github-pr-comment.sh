#!/usr/bin/env bash

set -euo pipefail

pr_number="${1:-}"
body_file="${2:-}"
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "$script_dir/.." && pwd)"

source "$script_dir/lib/github-env.sh"

if [[ -z "$pr_number" || -z "$body_file" ]]; then
  echo "Usage: $0 <pr-number> <body-file>" >&2
  exit 1
fi

if [[ ! -f "$body_file" ]]; then
  echo "Comment body file not found: $body_file" >&2
  exit 1
fi

body_realpath="$(realpath "$body_file")"
allowed_reviews_root="$(realpath "$repo_root/docs/pr-reviews")"
allowed_automation_root="$(realpath "$repo_root/docs/automation")"

if [[ "${body_realpath}" != "${allowed_reviews_root}"/* && "${body_realpath}" != "${allowed_automation_root}"/* ]]; then
  echo "Body file must be under docs/pr-reviews/ or docs/automation/: $body_file" >&2
  exit 1
fi

bash "$script_dir/with-github-env.sh" gh pr comment "$pr_number" --body-file "$body_realpath"
