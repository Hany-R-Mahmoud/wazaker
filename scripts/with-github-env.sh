#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "$script_dir/.." && pwd)"
github_token="${AUTOMATION_GITHUB_TOKEN:-${GITHUB_TOKEN:-${GH_TOKEN:-}}}"
has_direnv=0

if command -v direnv >/dev/null 2>&1; then
  has_direnv=1
fi

if [[ -n "$github_token" ]]; then
  exec env GH_TOKEN="$github_token" GITHUB_TOKEN="$github_token" "$@"
fi

if [[ "$has_direnv" -eq 1 ]]; then
  exec direnv exec "$repo_root" "$@"
fi

exec "$@"
