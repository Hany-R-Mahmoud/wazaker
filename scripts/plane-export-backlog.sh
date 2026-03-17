#!/usr/bin/env bash

set -euo pipefail

source_file="${1:-docs/product/plane-backlog.json}"
output_file="${2:-docs/product/plane-backlog.csv}"

if [[ ! -f "$source_file" ]]; then
  echo "Source backlog file not found: $source_file"
  exit 1
fi

mkdir -p "$(dirname "$output_file")"

{
  printf 'External ID,Type,Title,Summary,State,Priority,Parent ID,Agent Owner,Labels,Acceptance Criteria\n'
  jq -r '
    .items[]
    | [
        .id,
        .type,
        .title,
        .summary,
        .state,
        .priority,
        .parentId,
        .agentOwner,
        (.labels | join("|")),
        (.acceptance | join(" | "))
      ]
    | @csv
  ' "$source_file"
} > "$output_file"

echo "Generated $output_file from $source_file"
