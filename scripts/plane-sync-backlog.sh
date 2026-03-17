#!/usr/bin/env bash

set -euo pipefail

if [[ -f ".env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  . ".env.local"
  set +a
fi

source_file="${1:-docs/product/plane-backlog.json}"
plane_base_url="${PLANE_API_BASE_URL:-https://api.plane.so}"
workspace_slug="${PLANE_WORKSPACE_SLUG:-wazaker}"
project_id="${PLANE_PROJECT_ID:-3bddb944-c6c3-4fe1-aaec-a6b1be247789}"
api_key="${PLANE_API_KEY:-}"
default_assignee_email="${PLANE_DEFAULT_ASSIGNEE_EMAIL:-}"

if [[ -z "$api_key" ]]; then
  echo "PLANE_API_KEY is required."
  exit 1
fi

if [[ ! -f "$source_file" ]]; then
  echo "Source backlog file not found: $source_file"
  exit 1
fi

api() {
  local method="$1"
  local path="$2"
  local data="${3:-}"

  if [[ -n "$data" ]]; then
    curl -sS -L \
      -X "$method" \
      -H "X-API-Key: $api_key" \
      -H "Content-Type: application/json" \
      "$plane_base_url$path" \
      --data "$data"
  else
    curl -sS -L \
      -X "$method" \
      -H "X-API-Key: $api_key" \
      "$plane_base_url$path"
  fi
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

  external_id="$(printf '%s' "$item_json" | jq -r '.id')"
  summary="$(printf '%s' "$item_json" | jq -r '.summary')"
  acceptance_html="$(
    printf '%s' "$item_json" | jq -r '.acceptance[]?' | escape_html | sed 's/^/<li>/; s/$/<\/li>/'
  )"
  labels_html="$(
    printf '%s' "$item_json" | jq -r '.labels[]?' | escape_html | sed 's/^/<li><code>/; s/$/<\/code><\/li>/'
  )"

  cat <<EOF
<!-- wazaker-sync-id:${external_id} -->
<p>$(printf '%s' "$summary" | escape_html)</p>
<h3>Acceptance Criteria</h3>
<ul>${acceptance_html}</ul>
<h3>Repo Metadata</h3>
<ul>
  <li><strong>External ID:</strong> <code>${external_id}</code></li>
  <li><strong>Source:</strong> <code>docs/product/plane-backlog.json</code></li>
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
  local work_items_json="$2"
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

states_json="$(api GET "/api/v1/workspaces/${workspace_slug}/projects/${project_id}/states/")"
labels_json="$(api GET "/api/v1/workspaces/${workspace_slug}/projects/${project_id}/labels/")"
work_items_json="$(api GET "/api/v1/workspaces/${workspace_slug}/projects/${project_id}/work-items/?per_page=200&fields=id,name,description_html,state,created_at")"
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

mapfile -t item_lines < <(jq -c '.items[]' "$source_file")

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

  parent_id=""
  if [[ -n "$parent_external_id" && -n "${created_or_existing_ids[$parent_external_id]:-}" ]]; then
    parent_id="${created_or_existing_ids[$parent_external_id]}"
  fi

  payload="$(jq -nc \
    --arg name "$title" \
    --arg description_html "$description_html" \
    --arg state "$state_id" \
    --arg priority "$priority" \
    --arg parent "$parent_id" \
    --arg assignee "$default_assignee_id" \
    --argjson labels "$(printf '%s\n' "${label_ids[@]}" | jq -R . | jq -s 'map(select(length > 0))')" '
      {
        name: $name,
        description_html: $description_html,
        state: $state,
        priority: $priority,
        labels: $labels
      }
      + (if ($parent | length) > 0 then {parent: $parent} else {} end)
      + (if ($assignee | length) > 0 then {assignees: [$assignee]} else {} end)
    ')"

  existing_work_item_id="$(find_existing_work_item_id "$external_id" "$title" "$work_items_json")"

  if [[ -n "$existing_work_item_id" ]]; then
    api PATCH "$(work_item_url "$existing_work_item_id")" "$payload" >/dev/null
    created_or_existing_ids["$external_id"]="$existing_work_item_id"
    echo "Updated Plane work item ${external_id} -> ${existing_work_item_id}"
    continue
  fi

  created_json="$(api POST "/api/v1/workspaces/${workspace_slug}/projects/${project_id}/work-items/" "$payload")"
  created_id="$(printf '%s' "$created_json" | jq -r '.id')"

  if [[ -z "$created_id" || "$created_id" == "null" ]]; then
    echo "Failed to create Plane work item for ${external_id}"
    printf '%s\n' "$created_json"
    exit 1
  fi

  created_or_existing_ids["$external_id"]="$created_id"
  echo "Created Plane work item ${external_id} -> ${created_id}"

  work_items_json="$(api GET "/api/v1/workspaces/${workspace_slug}/projects/${project_id}/work-items/?per_page=200&fields=id,name,description_html,state,created_at")"
done
