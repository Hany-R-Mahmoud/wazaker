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

source_file="${1:-docs/product/plane-backlog.json}"
plane_base_url="${PLANE_API_BASE_URL:-https://api.plane.so}"
workspace_slug="${PLANE_WORKSPACE_SLUG:-wazaker}"
project_id="${PLANE_PROJECT_ID:-3bddb944-c6c3-4fe1-aaec-a6b1be247789}"
api_key="${PLANE_API_KEY:-}"
default_assignee_email="${PLANE_DEFAULT_ASSIGNEE_EMAIL:-}"

if [[ -z "$api_key" ]]; then
  echo "PLANE_API_KEY is required." >&2
  exit 1
fi

if [[ ! -f "$source_file" ]]; then
  echo "Source backlog file not found: $source_file" >&2
  exit 1
fi

api() {
  plane_api_request "$@"
}

escape_html() {
  sed \
    -e 's/&/\&amp;/g' \
    -e 's/</\&lt;/g' \
    -e 's/>/\&gt;/g'
}

build_description_html() {
  local item_json="$1"
  local external_id
  local summary
  local acceptance_html
  local labels_html
  local notes_html
  local depends_on_html
  local agent_owner

  external_id="$(printf '%s' "$item_json" | jq -r '.id')"
  summary="$(printf '%s' "$item_json" | jq -r '.summary')"
  agent_owner="$(printf '%s' "$item_json" | jq -r '.agentOwner // empty')"
  acceptance_html="$(
    printf '%s' "$item_json" | jq -r '.acceptance[]?' | escape_html | sed 's/^/<li>/; s/$/<\/li>/'
  )"
  labels_html="$(
    printf '%s' "$item_json" | jq -r '.labels[]?' | escape_html | sed 's/^/<li><code>/; s/$/<\/code><\/li>/'
  )"
  notes_html="$(
    printf '%s' "$item_json" | jq -r '.notes[]?' | escape_html | sed 's/^/<li>/; s/$/<\/li>/'
  )"
  depends_on_html="$(
    printf '%s' "$item_json" | jq -r '.dependsOn[]?' | escape_html | sed 's/^/<li><code>/; s/$/<\/code><\/li>/'
  )"

  cat <<EOF
<!-- wazaker-sync-id:${external_id} -->
<p>$(printf '%s' "$summary" | escape_html)</p>
<h3>Acceptance Criteria</h3>
<ul>${acceptance_html}</ul>
$(if [[ -n "$notes_html" ]]; then printf '<h3>Notes</h3>\n<ul>%s</ul>\n' "$notes_html"; fi)
$(if [[ -n "$depends_on_html" ]]; then printf '<h3>Depends On</h3>\n<ul>%s</ul>\n' "$depends_on_html"; fi)
<h3>Repo Metadata</h3>
<ul>
  <li><strong>External ID:</strong> <code>${external_id}</code></li>
  <li><strong>Source:</strong> <code>docs/product/plane-backlog.json</code></li>
  $(if [[ -n "$agent_owner" ]]; then printf '<li><strong>Agent Owner:</strong> <code>%s</code></li>' "$(printf '%s' "$agent_owner" | escape_html)"; fi)
</ul>
<h3>Labels</h3>
<ul>${labels_html}</ul>
EOF
}

slugify_color() {
  local value="$1"
  case "$value" in
    *urgent*) printf '%s' "#ef4444" ;;
    *high*) printf '%s' "#f59e0b" ;;
    *medium*) printf '%s' "#3b82f6" ;;
    *) printf '%s' "#6b7280" ;;
  esac
}

default_state_id() {
  local wanted_state="$1"
  local states_json="$2"

  printf '%s' "$states_json" | jq -r --arg wanted "$wanted_state" '
    (
      .results // .
    ) as $states
    | (
      $states[]
      | select((.name // "" | ascii_downcase) == ($wanted | ascii_downcase))
      | .id
    ),
    (
      $states[]
      | select((.group // "") == "backlog")
      | .id
    ),
    (
      $states[]
      | select((.group // "") == "unstarted")
      | .id
    ),
    (
      $states[]
      | select(.default == true)
      | .id
    )
  ' | head -n 1
}

ensure_label_id() {
  local label_name="$1"
  local labels_json="$2"
  local existing_id

  existing_id="$(printf '%s' "$labels_json" | jq -r --arg name "$label_name" '
    (.results // .)[]?
    | select((.name // "") == $name)
    | .id
  ' | head -n 1)"

  if [[ -n "$existing_id" ]]; then
    printf '%s\n' "$existing_id"
    return 0
  fi

  local payload
  payload="$(jq -nc --arg name "$label_name" --arg color "$(slugify_color "$label_name")" '{name: $name, color: $color}')"
  local created_json
  created_json="$(api POST "/api/v1/workspaces/${workspace_slug}/projects/${project_id}/labels/" "$payload")"
  printf '%s' "$created_json" | jq -r '.id'
}

find_existing_work_item_id() {
  local external_id="$1"
  local title="$2"
  local work_items_json="$3"
  local marker
  marker="<!-- wazaker-sync-id:${external_id} -->"

  printf '%s' "$work_items_json" | jq -r --arg marker "$marker" --arg title "$title" '
    [
      (.results // .)[]?
      | select((.description_html // "") | contains($marker))
    ] as $marker_matches
    | if ($marker_matches | length) > 0 then
        $marker_matches[0].id
      else
        [
          (.results // .)[]?
          | select((.name // "") == $title)
        ] as $title_matches
        | if ($title_matches | length) == 1 then
            $title_matches[0].id
          else
            empty
          end
      end
  ' | head -n 1
}

work_item_url() {
  local work_item_id="$1"
  printf '%s' "/api/v1/workspaces/${workspace_slug}/projects/${project_id}/work-items/${work_item_id}/"
}

work_items_path() {
  printf '%s' "/api/v1/workspaces/${workspace_slug}/projects/${project_id}/work-items/?per_page=200&fields=id,name,description_html,state,created_at,parent"
}

fetch_work_items_json() {
  local next_path
  local page_json
  local page_results
  local combined_results='[]'

  next_path="$(work_items_path)"

  while [[ -n "$next_path" ]]; do
    page_json="$(api GET "$next_path")"
    page_results="$(printf '%s' "$page_json" | jq -c '(.results // .)')"
    combined_results="$(jq -nc --argjson existing "$combined_results" --argjson page "$page_results" '$existing + $page')"
    next_path="$(printf '%s' "$page_json" | jq -r '.next // empty')"
    next_path="${next_path#"$plane_base_url"}"
  done

  jq -nc --argjson results "$combined_results" '{results: $results}'
}

states_json="$(api GET "/api/v1/workspaces/${workspace_slug}/projects/${project_id}/states/")"
labels_json="$(api GET "/api/v1/workspaces/${workspace_slug}/projects/${project_id}/labels/")"
work_items_json="$(fetch_work_items_json)"
members_json="$(api GET "/api/v1/workspaces/${workspace_slug}/projects/${project_id}/members/")"

default_assignee_id=""
if [[ -n "$default_assignee_email" ]]; then
  default_assignee_id="$(
    printf '%s' "$members_json" | jq -r --arg email "$default_assignee_email" '
      (.results // .)[]?
      | select((.email // "") == $email)
      | .id
    ' | head -n 1
  )"

  if [[ -z "$default_assignee_id" ]]; then
    echo "Could not resolve project member for PLANE_DEFAULT_ASSIGNEE_EMAIL=${default_assignee_email}"
    exit 1
  fi
fi

declare -A created_or_existing_ids
declare -A desired_parent_ids

item_lines_json="$(jq -ce '.items[]' "$source_file")" || {
  echo "Failed to parse backlog items from $source_file" >&2
  exit 1
}
item_lines=()
if [[ -n "$item_lines_json" ]]; then
  mapfile -t item_lines <<< "$item_lines_json"
fi

for item_json in "${item_lines[@]}"; do
  external_id="$(printf '%s' "$item_json" | jq -r '.id')"
  title="$(printf '%s' "$item_json" | jq -r '.title')"
  priority="$(printf '%s' "$item_json" | jq -r '.priority')"
  state_name="$(printf '%s' "$item_json" | jq -r '.state')"
  parent_external_id="$(printf '%s' "$item_json" | jq -r '.parentId')"
  description_html="$(build_description_html "$item_json")"
  state_id="$(default_state_id "$state_name" "$states_json")"

  if [[ -z "$state_id" ]]; then
    echo "Could not resolve a Plane state for backlog item ${external_id}."
    exit 1
  fi

  mapfile -t label_ids < <(
    printf '%s' "$item_json" | jq -r '.labels[]?' | while IFS= read -r label_name; do
      ensure_label_id "$label_name" "$labels_json"
    done
  )

  labels_json="$(api GET "/api/v1/workspaces/${workspace_slug}/projects/${project_id}/labels/")"

  payload="$(jq -nc \
    --arg name "$title" \
    --arg description_html "$description_html" \
    --arg state "$state_id" \
    --arg priority "$priority" \
    --arg assignee "$default_assignee_id" \
    --argjson labels "$(printf '%s\n' "${label_ids[@]}" | jq -R . | jq -s 'map(select(length > 0))')" '
      {
        name: $name,
        description_html: $description_html,
        state: $state,
        priority: $priority,
        labels: $labels
      }
      + (if ($assignee | length) > 0 then {assignees: [$assignee]} else {} end)
    ')"

  existing_work_item_id="$(find_existing_work_item_id "$external_id" "$title" "$work_items_json")"

  if [[ -n "$existing_work_item_id" ]]; then
    patch_response="$(api PATCH "$(work_item_url "$existing_work_item_id")" "$payload")"
    patched_id="$(printf '%s' "$patch_response" | jq -r '.id')"
    if [[ -z "$patched_id" || "$patched_id" == "null" ]]; then
      echo "Failed to update Plane work item for ${external_id}" >&2
      printf '%s\n' "$patch_response"
      exit 1
    fi
    created_or_existing_ids["$external_id"]="$existing_work_item_id"
    desired_parent_ids["$external_id"]="$parent_external_id"
    echo "Updated Plane work item ${external_id} -> ${existing_work_item_id}"
    continue
  fi

  created_json="$(api POST "/api/v1/workspaces/${workspace_slug}/projects/${project_id}/work-items/" "$payload")"
  created_id="$(printf '%s' "$created_json" | jq -r '.id')"

  if [[ -z "$created_id" || "$created_id" == "null" ]]; then
    echo "Failed to create Plane work item for ${external_id}" >&2
    printf '%s\n' "$created_json"
    exit 1
  fi

  created_or_existing_ids["$external_id"]="$created_id"
  desired_parent_ids["$external_id"]="$parent_external_id"
  echo "Created Plane work item ${external_id} -> ${created_id}"

  work_items_json="$(fetch_work_items_json)"
done

for external_id in "${!desired_parent_ids[@]}"; do
  parent_external_id="${desired_parent_ids[$external_id]}"

  if [[ -z "$parent_external_id" ]]; then
    continue
  fi

  parent_id="${created_or_existing_ids[$parent_external_id]:-}"
  child_id="${created_or_existing_ids[$external_id]:-}"

  if [[ -z "$parent_id" || -z "$child_id" ]]; then
    echo "Could not resolve parent mapping for backlog item ${external_id} -> ${parent_external_id}" >&2
    exit 1
  fi

  parent_patch_response="$(api PATCH "$(work_item_url "$child_id")" "$(jq -nc --arg parent "$parent_id" '{parent: $parent}')")"
  patched_parent="$(printf '%s' "$parent_patch_response" | jq -r '.parent // empty')"
  if [[ "$patched_parent" != "$parent_id" ]]; then
    echo "Failed to set parent for backlog item ${external_id} -> ${parent_external_id}" >&2
    printf '%s\n' "$parent_patch_response"
    exit 1
  fi
  echo "Linked Plane parent ${external_id} -> ${parent_external_id}"
done
