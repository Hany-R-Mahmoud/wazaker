#!/usr/bin/env bash

set -euo pipefail

if [[ -f ".env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  . ".env.local"
  set +a
fi

# shellcheck disable=SC1091
source "$(cd "$(dirname "$0")" && pwd)/lib/plane-api.sh"

plane_base_url="${PLANE_API_BASE_URL:-https://api.plane.so}"
workspace_slug="${PLANE_WORKSPACE_SLUG:-wazaker}"
project_id="${PLANE_PROJECT_ID:-3bddb944-c6c3-4fe1-aaec-a6b1be247789}"
api_key="${PLANE_API_KEY:-}"
source_file="${1:-docs/product/plane-backlog.json}"
mode="${PLANE_DEDUPE_MODE:-delete}"

if [[ -z "$api_key" ]]; then
  echo "PLANE_API_KEY is required."
  exit 1
fi

if [[ ! -f "$source_file" ]]; then
  echo "Source backlog file not found: $source_file"
  exit 1
fi

api() {
  plane_api_request "$@"
}

all_items_json="$(api GET "/api/v1/workspaces/${workspace_slug}/projects/${project_id}/work-items/?per_page=200&fields=id,name,description_html,created_at")"

mapfile -t source_rows < <(jq -r '.items[] | [.id, .title] | @tsv' "$source_file")

duplicate_count=0

for row in "${source_rows[@]}"; do
  IFS=$'\t' read -r external_id title <<< "$row"
  marker="<!-- wazaker-sync-id:${external_id} -->"

  matches_json="$(
    printf '%s' "$all_items_json" | jq -c --arg marker "$marker" --arg title "$title" '
      [
        (.results // .)[]?
        | select(
            ((.description_html // "") | contains($marker))
            or ((.name // "") == $title)
          )
      ]
      | unique_by(.id)
      | sort_by(.created_at)
    '
  )"

  match_count="$(printf '%s' "$matches_json" | jq 'length')"
  if (( match_count <= 1 )); then
    continue
  fi

  keep_id="$(printf '%s' "$matches_json" | jq -r '.[0].id')"
  echo "Keeping ${external_id} -> ${keep_id}"

  while IFS= read -r duplicate_id; do
    [[ -z "$duplicate_id" ]] && continue
    if [[ "$mode" == "delete" ]]; then
      api DELETE "/api/v1/workspaces/${workspace_slug}/projects/${project_id}/work-items/${duplicate_id}/" >/dev/null
      echo "Deleted duplicate ${external_id} -> ${duplicate_id}"
    else
      echo "Would delete duplicate ${external_id} -> ${duplicate_id}"
    fi
    duplicate_count=$((duplicate_count + 1))
  done < <(printf '%s' "$matches_json" | jq -r '.[1:][]?.id')
done

echo "Duplicate work items handled: $duplicate_count"
