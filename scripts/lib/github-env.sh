#!/usr/bin/env bash

set -euo pipefail

github_token="${AUTOMATION_GITHUB_TOKEN:-${GITHUB_TOKEN:-${GH_TOKEN:-}}}"

if [[ -n "$github_token" ]]; then
  export GH_TOKEN="$github_token"
  export GITHUB_TOKEN="$github_token"
fi
