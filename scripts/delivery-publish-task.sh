#!/usr/bin/env bash

set -euo pipefail

# shellcheck disable=SC1091
source "$(cd "$(dirname "$0")" && pwd)/delivery-common.sh"

run_dir_relative="${1:-}"

if [[ -z "$run_dir_relative" ]]; then
  echo "Usage: $0 <run-dir-relative-path>" >&2
  exit 1
fi

run_dir_absolute="$repo_root/$run_dir_relative"
metadata_file="$run_dir_absolute/metadata.json"
publish_report="$run_dir_absolute/publish-report.md"

if [[ ! -f "$metadata_file" ]]; then
  echo "Missing delivery run metadata in $run_dir_relative" >&2
  exit 1
fi

metadata_json="$(cat "$metadata_file")"
external_id="$(jq -r '.externalId' <<< "$metadata_json")"
title="$(jq -r '.title' <<< "$metadata_json")"
branch="$(jq -r '.branch' <<< "$metadata_json")"

if [[ "$(current_branch)" != "$branch" ]]; then
  echo "Expected branch '$branch' before publication." >&2
  exit 1
fi

if [[ -z "$(git -C "$repo_root" status --porcelain)" ]]; then
  echo "No changes available to publish." >&2
  exit 1
fi

commit_message="feat: implement ${external_id,,}"
pr_title="${external_id}: ${title}"
publish_output="$(cd "$repo_root" && bash ./scripts/pr-publish.sh "$commit_message" "$pr_title" 2>&1)"

pr_json='null'
if (cd "$repo_root" && bash ./scripts/with-github-env.sh gh pr view --json number,url,title,reviewDecision,mergeStateStatus >/dev/null 2>&1); then
  pr_json="$(cd "$repo_root" && bash ./scripts/with-github-env.sh gh pr view --json number,url,title,reviewDecision,mergeStateStatus)"
fi

{
  printf '# Delivery Publish Report\n\n'
  printf -- '- Published At: %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf -- '- Branch: `%s`\n' "$branch"
  printf '\n## Publish Output\n\n```text\n%s\n```\n' "$publish_output"
  printf '\n## PR Context\n\n```json\n%s\n```\n' "$pr_json"
} > "$publish_report"

updated_json="$(
  jq \
    --arg status "published" \
    --arg publishedAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg commitMessage "$commit_message" \
    --arg prTitle "$pr_title" \
    --argjson pr "$pr_json" \
    '.status = $status
    | .publishedAt = $publishedAt
    | .commitMessage = $commitMessage
    | .prTitle = $prTitle
    | .pr = $pr' \
    "$metadata_file"
)"
printf '%s\n' "$updated_json" > "$metadata_file"
write_lock_json "$updated_json"

printf '%s\n' "$updated_json"
