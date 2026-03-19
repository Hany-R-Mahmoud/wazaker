#!/usr/bin/env bash

set -euo pipefail

# shellcheck disable=SC1091
source "$(cd "$(dirname "$0")" && pwd)/delivery-common.sh"

external_id="${1:-}"
title="${2:-}"
priority="${3:-medium}"
summary="${4:-}"
acceptance_json="${5:-[]}"

if [[ -z "$external_id" || -z "$title" ]]; then
  echo "Usage: $0 <external-id> <title> [priority] [summary] [acceptance-json]" >&2
  exit 1
fi

if ! jq -e . >/dev/null 2>&1 <<< "$acceptance_json"; then
  acceptance_json='[]'
fi

require_no_delivery_lock
require_main_branch
require_clean_worktree
sync_main_if_possible

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
slug="$(slugify "$title")"
slug="${slug:0:40}"
branch="codex/$(slugify "$external_id")-${slug}"
run_dir_relative="docs/automation/delivery-runs/${timestamp}-${external_id}"
run_dir_absolute="$repo_root/$run_dir_relative"
metadata_file="$run_dir_absolute/metadata.json"
brief_file="$run_dir_absolute/task-brief.md"

mkdir -p "$run_dir_absolute"
git -C "$repo_root" checkout -b "$branch" >/dev/null

metadata_json="$(
  jq -nc \
    --arg externalId "$external_id" \
    --arg title "$title" \
    --arg priority "$priority" \
    --arg summary "$summary" \
    --arg branch "$branch" \
    --arg runDir "$run_dir_relative" \
    --arg preparedAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --argjson acceptance "$acceptance_json" \
    '{
      externalId: $externalId,
      title: $title,
      priority: $priority,
      summary: $summary,
      acceptance: $acceptance,
      branch: $branch,
      runDir: $runDir,
      status: "prepared",
      preparedAt: $preparedAt
    }'
)"

printf '%s\n' "$metadata_json" > "$metadata_file"
write_lock_json "$metadata_json"

{
  printf '# Delivery Task Brief\n\n'
  printf -- '- External ID: `%s`\n' "$external_id"
  printf -- '- Title: %s\n' "$title"
  printf -- '- Priority: %s\n' "$priority"
  printf -- '- Branch: `%s`\n' "$branch"
  printf -- '- Prepared At: %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf '\n## Summary\n\n%s\n' "${summary:-No summary provided.}"
  printf '\n## Acceptance Criteria\n\n'
  jq -r '.[]? | "- " + .' <<< "$acceptance_json"
} > "$brief_file"

printf '%s\n' "$metadata_json"
