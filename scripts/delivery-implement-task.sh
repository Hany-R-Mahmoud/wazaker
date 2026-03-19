#!/usr/bin/env bash

set -euo pipefail

# shellcheck disable=SC1091
source "$(cd "$(dirname "$0")" && pwd)/delivery-common.sh"

run_dir_relative="${1:-}"

if [[ -z "$run_dir_relative" ]]; then
  echo "Usage: $0 <run-dir-relative-path>" >&2
  exit 1
fi

run_dir_absolute="$repo_root/$run_dir_relative"
metadata_file="$run_dir_absolute/metadata.json"
brief_file="$run_dir_absolute/task-brief.md"
execution_report="$run_dir_absolute/execution-report.md"

if [[ ! -f "$metadata_file" || ! -f "$brief_file" ]]; then
  echo "Missing delivery run metadata or brief in $run_dir_relative" >&2
  exit 1
fi

metadata_json="$(cat "$metadata_file")"
branch="$(jq -r '.branch' <<< "$metadata_json")"

if [[ "$(current_branch)" != "$branch" ]]; then
  echo "Expected branch '$branch' before implementation." >&2
  exit 1
fi

require_clean_worktree

prompt_file="$(mktemp)"
cat > "$prompt_file" <<EOF
You are implementing one guarded delivery task for the Wazaker repository.

Read and follow this task brief first:
$brief_file

Required operating docs:
- docs/setup/guarded-delivery-pipeline.md
- docs/agents/operating-model.md
- docs/setup/github-flow.md

Rules:
1. Only implement the scoped task.
2. Do not touch unrelated behavior.
3. Prefer small coherent changes.
4. Use the existing project patterns.
5. Run lightweight validation when relevant.
6. Do not publish or merge; this step only produces local implementation changes.
7. Leave a concise summary of changed files, checks run, and remaining risks in $execution_report if it does not exist.
EOF

codex exec --full-auto -C "$repo_root" "$(cat "$prompt_file")"
rm -f "$prompt_file"

validation_status="not-run"
validation_note="No automated validation command was available."
if [[ -f "$repo_root/package.json" ]] && grep -q '"typescript"' "$repo_root/package.json"; then
  if (cd "$repo_root" && npx tsc --noEmit >/dev/null 2>&1); then
    validation_status="passed"
    validation_note="npx tsc --noEmit passed."
  else
    validation_status="failed"
    validation_note="npx tsc --noEmit failed."
  fi
fi

changed_files="$(git -C "$repo_root" diff --name-only)"
{
  printf '# Delivery Execution Report\n\n'
  printf -- '- Executed At: %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf -- '- Branch: `%s`\n' "$branch"
  printf -- '- Validation: `%s`\n' "$validation_status"
  printf -- '- Validation Note: %s\n' "$validation_note"
  printf '\n## Changed Files\n\n'
  if [[ -n "$changed_files" ]]; then
    while IFS= read -r file; do
      [[ -n "$file" ]] && printf -- '- `%s`\n' "$file"
    done <<< "$changed_files"
  else
    printf 'No source changes were produced.\n'
  fi
} > "$execution_report"

updated_json="$(
  jq \
    --arg status "implemented" \
    --arg implementedAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg validationStatus "$validation_status" \
    --arg validationNote "$validation_note" \
    '.status = $status
    | .implementedAt = $implementedAt
    | .validationStatus = $validationStatus
    | .validationNote = $validationNote' \
    "$metadata_file"
)"
printf '%s\n' "$updated_json" > "$metadata_file"
write_lock_json "$updated_json"

if [[ "$validation_status" == "failed" ]]; then
  echo "Implementation completed but validation failed." >&2
  exit 1
fi

printf '%s\n' "$updated_json"
