#!/usr/bin/env bash

set -euo pipefail

current_branch="$(git branch --show-current)"

if [[ "$current_branch" == "main" ]]; then
  echo "Already on main. Expected a feature branch."
  exit 1
fi

if ! env -u GH_TOKEN gh auth status >/dev/null 2>&1; then
  echo "gh is not authenticated cleanly. Merge must be done manually in GitHub."
  exit 1
fi

env -u GH_TOKEN gh pr merge --squash --delete-branch
git checkout main
git pull --ff-only origin main

echo "Merged PR, deleted branch, and synced main."
