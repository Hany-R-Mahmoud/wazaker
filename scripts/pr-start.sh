#!/usr/bin/env bash

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <short-branch-name>"
  exit 1
fi

branch_name="$1"

if [[ "$branch_name" != codex/* ]]; then
  branch_name="codex/$branch_name"
fi

current_branch="$(git branch --show-current)"

if [[ "$current_branch" != "main" ]]; then
  echo "Switch to main before starting a new branch. Current branch: $current_branch"
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit or stash changes before branching."
  exit 1
fi

git fetch origin
git pull --ff-only origin main
git checkout -b "$branch_name"

echo "Created and switched to $branch_name"
