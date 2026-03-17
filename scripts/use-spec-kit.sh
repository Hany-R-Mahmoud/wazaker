#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
export CODEX_HOME="$repo_root/.codex"

resolve_latest_feature() {
  local specs_dir="$repo_root/specs"

  if [[ ! -d "$specs_dir" ]]; then
    return 1
  fi

  find "$specs_dir" -maxdepth 1 -mindepth 1 -type d -name '[0-9][0-9][0-9]-*' \
    | sort \
    | tail -n 1 \
    | xargs -I{} basename "{}"
}

feature_name="${1:-}"
current_branch="$(git branch --show-current 2>/dev/null || true)"

if [[ -n "$feature_name" ]]; then
  export SPECIFY_FEATURE="$feature_name"
elif [[ "$current_branch" =~ ^[0-9]{3}- ]]; then
  export SPECIFY_FEATURE="$current_branch"
else
  latest_feature="$(resolve_latest_feature || true)"
  if [[ -n "$latest_feature" ]]; then
    export SPECIFY_FEATURE="$latest_feature"
  fi
fi

echo "CODEX_HOME set to: $CODEX_HOME"
if [[ -n "${SPECIFY_FEATURE:-}" ]]; then
  echo "SPECIFY_FEATURE set to: $SPECIFY_FEATURE"
fi
echo "Spec Kit prompts are ready in .codex/prompts"
echo "Suggested next command: /speckit.specify"
