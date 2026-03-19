#!/usr/bin/env bash

set -euo pipefail

source ./scripts/lib/github-env.sh

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <commit-message> <pr-title> [pr-body-file]"
  exit 1
fi

commit_message="$1"
pr_title="$2"
pr_body_file="${3:-}"

current_branch="$(git branch --show-current)"

if [[ "$current_branch" == "main" ]]; then
  echo "Refusing to publish directly from main."
  exit 1
fi

git add .

if git diff --cached --quiet; then
  echo "No staged changes to commit."
else
  git commit -m "$commit_message"
fi

git push -u origin "$current_branch"

if [[ -z "$pr_body_file" ]]; then
  pr_body_file="$(bash ./scripts/pr-summary.sh)"
fi

if bash ./scripts/with-github-env.sh gh auth status >/dev/null 2>&1; then
  if [[ -n "$pr_body_file" ]]; then
    bash ./scripts/with-github-env.sh gh pr create --fill --title "$pr_title" --body-file "$pr_body_file"
  else
    bash ./scripts/with-github-env.sh gh pr create --fill --title "$pr_title"
  fi
else
  echo "gh is not authenticated cleanly. Push succeeded, but PR creation was skipped."
  echo "Create the PR manually from: https://github.com/Hany-R-Mahmoud/wazaker/pull/new/$current_branch"
  echo "Suggested PR body file: $pr_body_file"
fi
