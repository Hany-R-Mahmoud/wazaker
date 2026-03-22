#!/usr/bin/env bash

set -euo pipefail

source ./scripts/lib/github-env.sh

pr_ref="${1:-}"
branch_name="${2:-$(git branch --show-current)}"
output_dir="docs/pr-reviews"
safe_branch="${branch_name//\//-}"

mkdir -p "$output_dir"

pr_json_file="$output_dir/${safe_branch}-pr-status.json"
comments_file="$output_dir/${safe_branch}-review-comments.json"
raw_comments_file="$output_dir/${safe_branch}-review-comments.raw.json"
gate_file="$output_dir/${safe_branch}-review-gate.json"

run_with_retry() {
  local attempts="$1"
  local delay_seconds="$2"
  shift 2

  local attempt=1
  until "$@"; do
    if (( attempt >= attempts )); then
      return 1
    fi

    sleep "$delay_seconds"
    attempt=$((attempt + 1))
  done
}

validate_json_file() {
  local file_path="$1"
  jq -e . "$file_path" >/dev/null 2>&1
}

if [[ -n "$pr_ref" && "$pr_ref" =~ ^[0-9]+$ ]]; then
  pr_view_ref="$pr_ref"
else
  pr_view_ref="${pr_ref:-$branch_name}"
fi

tmp_pr_json="$(mktemp "${output_dir}/${safe_branch}-pr-status.tmp.XXXXXX")"
tmp_raw_comments="$(mktemp "${output_dir}/${safe_branch}-review-comments.raw.tmp.XXXXXX")"
tmp_comments="$(mktemp "${output_dir}/${safe_branch}-review-comments.tmp.XXXXXX")"
tmp_gate="$(mktemp "${output_dir}/${safe_branch}-review-gate.tmp.XXXXXX")"

cleanup() {
  rm -f "$tmp_pr_json" "$tmp_raw_comments" "$tmp_comments" "$tmp_gate"
}

trap cleanup EXIT

run_with_retry 3 2 bash ./scripts/with-github-env.sh gh pr view "$pr_view_ref" \
  --json number,url,title,reviewDecision,latestReviews,reviews,comments,statusCheckRollup,mergeStateStatus \
  > "$tmp_pr_json"
validate_json_file "$tmp_pr_json"

run_with_retry 3 2 npx agent-reviews --pr "$(jq -r '.number' "$tmp_pr_json")" --unresolved --bots-only --json > "$tmp_raw_comments"
validate_json_file "$tmp_raw_comments"

python3 ./scripts/pr-filter-agent-reviews.py "$tmp_raw_comments" "$tmp_comments" >/dev/null
validate_json_file "$tmp_comments"

node ./scripts/pr-review-gate.mjs "$tmp_pr_json" "$tmp_comments" > "$tmp_gate"
validate_json_file "$tmp_gate"

mv "$tmp_pr_json" "$pr_json_file"
mv "$tmp_raw_comments" "$raw_comments_file"
mv "$tmp_comments" "$comments_file"
mv "$tmp_gate" "$gate_file"

echo "$pr_json_file"
