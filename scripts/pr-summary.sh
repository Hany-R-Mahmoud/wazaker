#!/usr/bin/env bash

set -euo pipefail

branch_name="$(git branch --show-current)"
safe_branch="${branch_name//\//-}"
output_dir="docs/pr-reviews"
output_file="${1:-$output_dir/${safe_branch}-pr-summary.md}"

mkdir -p "$output_dir"

base_branch="${BASE_BRANCH:-main}"
commit_list="$(git log --no-merges --pretty='- %s' "origin/${base_branch}..HEAD" 2>/dev/null || git log --no-merges --pretty='- %s')"
changed_files="$(git diff --name-only "origin/${base_branch}...HEAD" 2>/dev/null || git diff --name-only)"
validation_lines=()

if [[ -f package.json ]] && grep -q '"typescript"' package.json; then
  if npx tsc --noEmit >/dev/null 2>&1; then
    validation_lines+=("- `npx tsc --noEmit`")
  fi
fi

if [[ ${#validation_lines[@]} -eq 0 ]]; then
  validation_lines+=("- Validation not automated in this summary script")
fi

{
  echo "## Summary"
  echo
  echo "This PR updates \`$branch_name\` and prepares the next step of the \`wazaker\` project with a clean, reviewable change set."
  echo
  echo "## What Changed"
  echo
  echo "### Commits"
  echo
  if [[ -n "$commit_list" ]]; then
    echo "$commit_list"
  else
    echo "- No branch-local commits detected"
  fi
  echo
  echo "### Touched Areas"
  echo
  if [[ -n "$changed_files" ]]; then
    while IFS= read -r file; do
      [[ -n "$file" ]] && echo "- \`$file\`"
    done <<< "$changed_files"
  else
    echo "- No file diff detected"
  fi
  echo
  echo "## Validation"
  echo
  printf '%s\n' "${validation_lines[@]}"
  echo
  echo "## Follow-ups"
  echo
  echo "- Review CodeRabbit feedback on this PR branch"
  echo "- Resolve review findings on the same branch if needed"
  echo "- Merge after approval and sync \`main\`"
} > "$output_file"

echo "$output_file"
