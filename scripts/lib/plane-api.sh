#!/usr/bin/env bash

plane_api_request() {
  local method="$1"
  local path="$2"
  local data="${3:-}"

  if [[ -z "${plane_base_url:-}" ]]; then
    echo "plane_api_request requires plane_base_url to be set." >&2
    return 1
  fi

  if [[ -z "${api_key:-}" ]]; then
    echo "plane_api_request requires api_key to be set." >&2
    return 1
  fi

  if [[ -n "$data" ]]; then
    curl --fail -sS -L \
      -X "$method" \
      -H "X-API-Key: $api_key" \
      -H "Content-Type: application/json" \
      "$plane_base_url$path" \
      --data "$data"
    return $?
  fi

  curl --fail -sS -L \
    -X "$method" \
    -H "X-API-Key: $api_key" \
    "$plane_base_url$path"
}
