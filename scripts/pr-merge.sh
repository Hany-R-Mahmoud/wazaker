#!/usr/bin/env bash

set -euo pipefail

current_branch="$(git branch --show-current)"

if [[ "$current_branch" == "main" ]]; then
  echo "Already on main. Expected a feature branch."
  exit 1
fi

if ! bash ./scripts/with-repo-env.sh gh auth status >/dev/null 2>&1; then
  echo "gh is not authenticated cleanly. Merge must be done manually in GitHub."
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit or discard changes before merging."
  exit 1
fi

if ! bash ./scripts/pr-check-unresolved.sh "$(bash ./scripts/with-repo-env.sh gh pr view --json number -q .number)" "$current_branch"; then
  echo "PR still has unresolved review threads. Refusing to merge."
  exit 1
fi

bash ./scripts/with-repo-env.sh gh pr merge --squash --delete-branch
git checkout main
git pull --ff-only origin main

echo "Merged PR, deleted branch, and synced main."
