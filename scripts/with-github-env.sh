#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "$script_dir/.." && pwd)"
github_token="${AUTOMATION_GITHUB_TOKEN:-${GITHUB_TOKEN:-${GH_TOKEN:-}}}"

if [[ -n "$github_token" ]]; then
  exec direnv exec "$repo_root" env GH_TOKEN="$github_token" GITHUB_TOKEN="$github_token" "$@"
fi

exec direnv exec "$repo_root" "$@"
