#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
automation_dir="$repo_root/.automation"
delivery_lock_file="$automation_dir/delivery-lock.json"
delivery_runs_dir="$repo_root/docs/automation/delivery-runs"

mkdir -p "$automation_dir" "$delivery_runs_dir"

slugify() {
  printf '%s' "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g'
}

current_branch() {
  git -C "$repo_root" branch --show-current
}

warn_delivery_lock_parse_error() {
  echo "Warning: could not parse delivery lock file: $delivery_lock_file" >&2
}

delivery_lock_is_valid_json() {
  jq -e . "$delivery_lock_file" >/dev/null 2>&1
}

delivery_lock_branch() {
  local branch=""
  if branch="$(jq -r '.branch // empty' "$delivery_lock_file" 2>/dev/null)"; then
    printf '%s\n' "$branch"
    return 0
  fi

  warn_delivery_lock_parse_error
  printf '\n'
}

delivery_lock_status() {
  local status="unknown"
  if status="$(jq -r '.status // "unknown"' "$delivery_lock_file" 2>/dev/null)"; then
    printf '%s\n' "$status"
    return 0
  fi

  warn_delivery_lock_parse_error
  printf '%s\n' "unknown"
}

delivery_lock_branch_merged_into_main() {
  local branch="${1:-}"
  local resolved_ref=""
  if [[ -z "$branch" ]]; then
    return 1
  fi

  if git -C "$repo_root" rev-parse --verify "refs/heads/$branch" >/dev/null 2>&1; then
    resolved_ref="refs/heads/$branch"
  elif git -C "$repo_root" rev-parse --verify "refs/remotes/origin/$branch" >/dev/null 2>&1; then
    resolved_ref="refs/remotes/origin/$branch"
  else
    return 1
  fi

  git -C "$repo_root" merge-base --is-ancestor "$resolved_ref" main >/dev/null 2>&1
}

require_clean_worktree() {
  if [[ -n "$(git -C "$repo_root" status --porcelain)" ]]; then
    echo "Working tree is not clean." >&2
    exit 1
  fi
}

require_main_branch() {
  local branch
  branch="$(current_branch)"
  if [[ "$branch" != "main" ]]; then
    echo "Expected to be on main, found '$branch'." >&2
    exit 1
  fi
}

read_lock_json() {
  if [[ -f "$delivery_lock_file" ]]; then
    cat "$delivery_lock_file"
    return 0
  fi
  return 1
}

write_lock_json() {
  local temp_file
  temp_file="$(mktemp "$automation_dir/delivery-lock.tmp.XXXXXX")"
  printf '%s\n' "$1" > "$temp_file"
  mv "$temp_file" "$delivery_lock_file"
}

remove_lock() {
  rm -f "$delivery_lock_file"
}

clear_stale_delivery_lock_if_safe() {
  if [[ ! -f "$delivery_lock_file" ]]; then
    return 0
  fi

  if ! delivery_lock_is_valid_json; then
    warn_delivery_lock_parse_error
    return 0
  fi

  local branch
  local status
  branch="$(delivery_lock_branch)"
  status="$(delivery_lock_status)"

  # If the delivery branch is already in main, the lock is stale and should
  # not block the next autonomous task.
  if delivery_lock_branch_merged_into_main "$branch"; then
    echo "Clearing stale delivery lock for merged branch '$branch' (status: $status)." >&2
    remove_lock
  fi
}

sync_main_if_possible() {
  if git -C "$repo_root" remote get-url origin >/dev/null 2>&1; then
    git -C "$repo_root" fetch origin >/dev/null 2>&1 || true
    git -C "$repo_root" pull --ff-only origin main >/dev/null 2>&1 || true
  fi
}

require_no_delivery_lock() {
  clear_stale_delivery_lock_if_safe

  if [[ -f "$delivery_lock_file" ]]; then
    if ! delivery_lock_is_valid_json; then
      echo "Delivery lock exists but is unreadable or malformed: $delivery_lock_file" >&2
      exit 1
    fi
    echo "Delivery lock already exists: $delivery_lock_file" >&2
    exit 1
  fi
}
