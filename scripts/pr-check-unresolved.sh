#!/usr/bin/env bash

set -euo pipefail

pr_number="${1:-}"
branch_name="${2:-$(git branch --show-current)}"
safe_branch="${branch_name//\//-}"
output_dir="docs/pr-reviews"
threads_file="$output_dir/${safe_branch}-review-threads.json"
comments_file="$output_dir/${safe_branch}-review-comments.json"
gate_file="$output_dir/${safe_branch}-review-gate.json"

if [[ -z "$pr_number" ]]; then
  pr_number="$(bash ./scripts/with-repo-env.sh gh pr view --json number -q .number)"
fi

if [[ -z "$pr_number" ]]; then
  echo "Could not determine PR number."
  exit 1
fi

bash ./scripts/pr-watch.sh "$pr_number" >/dev/null
bash ./scripts/pr-thread-sync.sh "$pr_number" "$branch_name" >/dev/null || true
node ./scripts/pr-review-gate.mjs "$pr_json_file" "$comments_file" > "$gate_file"

repo_json="$(bash ./scripts/with-repo-env.sh gh repo view --json owner,name)"
owner="$(printf '%s' "$repo_json" | jq -r '.owner.login')"
repo="$(printf '%s' "$repo_json" | jq -r '.name')"

query='
query($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      reviewThreads(first: 100) {
        nodes {
          isResolved
          comments(first: 20) {
            nodes {
              author {
                login
              }
            }
          }
        }
      }
    }
  }
}'

bash ./scripts/with-repo-env.sh gh api graphql \
  -f query="$query" \
  -F owner="$owner" \
  -F repo="$repo" \
  -F number="$pr_number" \
  > "$threads_file"

human_open_count="$(jq '
  [
    .data.repository.pullRequest.reviewThreads.nodes[]?
    | select(.isResolved == false)
    | .comments.nodes[-1].author.login // ""
    | ascii_downcase
    | select((contains("coderabbit") or contains("chatgpt-codex-connector")) | not)
  ] | length
' "$threads_file")"

bot_open_count="$(jq '[.[]?] | length' "$comments_file")"
bot_pending_count="$(jq '[.pendingSignals[]?] | length' "$gate_file")"
bot_activity_seen="$(jq -r '.botActivitySeen' "$gate_file")"

echo "Unresolved human threads: $human_open_count"
echo "Unresolved bot threads: $bot_open_count"
echo "Pending bot review signals: $bot_pending_count"
echo "Bot activity seen: $bot_activity_seen"

if [[ "$human_open_count" != "0" || "$bot_open_count" != "0" || "$bot_pending_count" != "0" ]]; then
  exit 2
fi

if [[ "${REQUIRE_BOT_REVIEW_ACTIVITY:-1}" == "1" && "$bot_activity_seen" != "true" ]]; then
  exit 2
fi
