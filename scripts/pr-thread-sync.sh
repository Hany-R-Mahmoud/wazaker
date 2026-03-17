#!/usr/bin/env bash

set -euo pipefail

pr_number="${1:-}"
branch_name="${2:-$(git branch --show-current)}"
safe_branch="${branch_name//\//-}"
output_dir="docs/pr-reviews"
threads_file="$output_dir/${safe_branch}-review-threads.json"
reply_template_file="${PR_THREAD_REPLY_TEMPLATE_FILE:-}"

mkdir -p "$output_dir"

if [[ -z "$pr_number" ]]; then
  pr_number="$(bash ./scripts/with-repo-env.sh gh pr view --json number -q .number)"
fi

if [[ -z "$pr_number" ]]; then
  echo "Could not determine PR number."
  exit 1
fi

if ! bash ./scripts/with-repo-env.sh gh auth status >/dev/null 2>&1; then
  echo "gh is not authenticated cleanly. Cannot sync review threads."
  exit 1
fi

repo_json="$(bash ./scripts/with-repo-env.sh gh repo view --json owner,name)"
owner="$(printf '%s' "$repo_json" | jq -r '.owner.login')"
repo="$(printf '%s' "$repo_json" | jq -r '.name')"
viewer_login="$(bash ./scripts/with-repo-env.sh gh api user -q .login)"
head_sha="$(git rev-parse --short HEAD)"
default_reply="Addressed on branch \`$(git branch --show-current)\` in commit \`${head_sha}\`. Resolving this thread automatically; reopen it if anything is still outstanding."

if [[ -n "$reply_template_file" && -f "$reply_template_file" ]]; then
  reply_body="$(cat "$reply_template_file")"
else
  reply_body="$default_reply"
fi

query='
query($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      reviewThreads(first: 100) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(first: 20) {
            nodes {
              id
              body
              createdAt
              url
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

thread_count="$(jq '[.data.repository.pullRequest.reviewThreads.nodes[]? | select(.isResolved == false)] | length' "$threads_file")"

if [[ "$thread_count" == "0" ]]; then
  echo "No unresolved review threads."
  exit 0
fi

bot_pattern='(^coderabbit|^chatgpt-codex-connector)'
synced_count=0
skipped_human_count=0

while IFS=$'\t' read -r thread_id last_author already_replied url path line; do
  if [[ -z "$thread_id" ]]; then
    continue
  fi

  if [[ ! "$last_author" =~ $bot_pattern ]]; then
    skipped_human_count=$((skipped_human_count + 1))
    continue
  fi

  if [[ "$already_replied" != "true" ]]; then
    reply_mutation='
    mutation($threadId: ID!, $body: String!) {
      addPullRequestReviewThreadReply(input: {
        pullRequestReviewThreadId: $threadId,
        body: $body
      }) {
        comment {
          id
        }
      }
    }'

    bash ./scripts/with-repo-env.sh gh api graphql \
      -f query="$reply_mutation" \
      -F threadId="$thread_id" \
      -f body="$reply_body" \
      >/dev/null
  fi

  resolve_mutation='
  mutation($threadId: ID!) {
    resolveReviewThread(input: {
      threadId: $threadId
    }) {
      thread {
        isResolved
      }
    }
  }'

  bash ./scripts/with-repo-env.sh gh api graphql \
    -f query="$resolve_mutation" \
    -F threadId="$thread_id" \
    >/dev/null

  synced_count=$((synced_count + 1))
  echo "Replied to and resolved thread on ${path:-unknown}:${line:-unknown} (${url})"
done < <(
  jq -r --arg viewer "$viewer_login" '
    .data.repository.pullRequest.reviewThreads.nodes[]?
    | select(.isResolved == false)
    | . as $thread
    | ($thread.comments.nodes | last) as $last
    | [
        $thread.id,
        ($last.author.login // ""),
        (
          [
            $thread.comments.nodes[]?
            | select((.author.login // "") == $viewer)
          ] | length > 0
        ),
        ($last.url // ""),
        ($thread.path // ""),
        (($thread.line // 0) | tostring)
      ]
    | @tsv
  ' "$threads_file"
)

echo "Resolved bot threads: $synced_count"
echo "Skipped non-bot threads: $skipped_human_count"
