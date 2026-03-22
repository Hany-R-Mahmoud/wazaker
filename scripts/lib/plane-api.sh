#!/usr/bin/env bash

set -euo pipefail

plane_api_request() {
  local method="$1"
  local path="$2"
  local data="${3:-}"
  local max_attempts="${PLANE_API_MAX_ATTEMPTS:-5}"
  local backoff_seconds="${PLANE_API_INITIAL_BACKOFF_SECONDS:-2}"
  local attempt=1

  while (( attempt <= max_attempts )); do
    local body_file
    local headers_file
    local status_code
    local curl_exit=0
    local retry_after=""

    body_file="$(mktemp)"
    headers_file="$(mktemp)"

    set +e
    if [[ -n "$data" ]]; then
      status_code="$(
        curl -sS -L \
          -o "$body_file" \
          -D "$headers_file" \
          -w '%{http_code}' \
          -X "$method" \
          -H "X-API-Key: $api_key" \
          -H "Content-Type: application/json" \
          "$plane_base_url$path" \
          --data "$data"
      )"
      curl_exit=$?
    else
      status_code="$(
        curl -sS -L \
          -o "$body_file" \
          -D "$headers_file" \
          -w '%{http_code}' \
          -X "$method" \
          -H "X-API-Key: $api_key" \
          "$plane_base_url$path"
      )"
      curl_exit=$?
    fi
    set -e

    if (( curl_exit == 0 )) && [[ "$status_code" =~ ^2[0-9][0-9]$ ]]; then
      cat "$body_file"
      rm -f "$body_file" "$headers_file"
      return 0
    fi

    retry_after="$(
      awk 'tolower($1) == "retry-after:" { gsub("\r", "", $2); print $2; exit }' "$headers_file"
    )"

    if (( attempt < max_attempts )) && {
      (( curl_exit != 0 )) ||
      [[ "$status_code" == "429" ]] ||
      [[ "$status_code" =~ ^5[0-9][0-9]$ ]];
    }; then
      local sleep_seconds="${retry_after:-$backoff_seconds}"
      echo "Plane API ${method} ${path} hit a retryable failure (curl=${curl_exit}, status=${status_code:-none}). Retrying in ${sleep_seconds}s." >&2
      rm -f "$body_file" "$headers_file"
      sleep "$sleep_seconds"
      backoff_seconds=$((backoff_seconds * 2))
      attempt=$((attempt + 1))
      continue
    fi

    echo "Plane API request failed: ${method} ${path} (curl=${curl_exit}, status=${status_code:-none})" >&2
    if [[ -s "$body_file" ]]; then
      cat "$body_file" >&2
      echo >&2
    fi
    rm -f "$body_file" "$headers_file"
    return 1
  done

  echo "Plane API request exhausted all retry attempts: ${method} ${path}" >&2
  return 1
}
