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

require_no_delivery_lock() {
  if [[ -f "$delivery_lock_file" ]]; then
    echo "Delivery lock already exists: $delivery_lock_file" >&2
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
  printf '%s\n' "$1" > "$delivery_lock_file"
}

remove_lock() {
  rm -f "$delivery_lock_file"
}

sync_main_if_possible() {
  if git -C "$repo_root" remote get-url origin >/dev/null 2>&1; then
    git -C "$repo_root" fetch origin >/dev/null 2>&1 || true
    git -C "$repo_root" pull --ff-only origin main >/dev/null 2>&1 || true
  fi
}
