#!/usr/bin/env bash

set -euo pipefail

pr_number="${1:-}"
current_branch="$(git branch --show-current)"
delivery_lock_file=".automation/delivery-lock.json"
safe_branch="${current_branch//\//-}"
gate_file="docs/pr-reviews/${safe_branch}-review-gate.json"

if [[ "$current_branch" == "main" ]]; then
  echo "Already on main. Expected a feature branch."
  exit 1
fi

if [[ -z "$pr_number" ]]; then
  pr_number="$(bash ./scripts/with-repo-env.sh gh pr view --json number -q .number 2>/dev/null || true)"
fi

if [[ -z "$pr_number" ]]; then
  echo "Could not determine the PR number through gh. Merge must be done manually in GitHub."
  exit 1
fi

if ! bash ./scripts/with-repo-env.sh gh pr view "$pr_number" --json number >/dev/null 2>&1; then
  echo "Could not query PR #$pr_number through gh. Merge must be done manually in GitHub."
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit or discard changes before merging."
  exit 1
fi

if ! bash ./scripts/pr-check-unresolved.sh "$pr_number" "$current_branch"; then
  echo "PR #$pr_number still has unresolved review threads. Refusing to merge."
  exit 1
fi

if [[ ! -f "$gate_file" ]]; then
  echo "Missing review gate artifact at $gate_file. Run the review cycle before merging."
  exit 1
fi

if [[ "$(jq -r '.clearToMerge' "$gate_file")" != "true" ]]; then
  echo "PR #$pr_number is not clear to merge yet."
  jq -r '.reasons[]?' "$gate_file"
  exit 1
fi

bash ./scripts/with-repo-env.sh gh pr merge "$pr_number" --squash --delete-branch
git checkout main
git pull --ff-only origin main

if [[ -f "$delivery_lock_file" ]]; then
  locked_branch="$(jq -r '.branch // empty' "$delivery_lock_file")"
  run_dir="$(jq -r '.runDir // empty' "$delivery_lock_file")"
  if [[ -n "$locked_branch" && "$locked_branch" == "$current_branch" && -n "$run_dir" ]]; then
    metadata_file="$run_dir/metadata.json"
    completion_report="$run_dir/completion-report.md"
    if [[ -f "$metadata_file" ]]; then
      jq \
        --arg status "merged" \
        --arg mergedAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        '.status = $status | .mergedAt = $mergedAt' \
        "$metadata_file" > "${metadata_file}.tmp"
      mv "${metadata_file}.tmp" "$metadata_file"
      {
        printf '# Delivery Completion Report\n\n'
        printf -- '- Merged At: %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
        printf -- '- Merged Branch: `%s`\n' "$current_branch"
        printf -- '- Result: merged and main synced\n'
      } > "$completion_report"
    fi
    rm -f "$delivery_lock_file"
  fi
fi

echo "Merged PR, deleted branch, and synced main."
