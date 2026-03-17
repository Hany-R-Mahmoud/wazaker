---
name: pr-review-resolver
description: Resolve pull request review feedback for this repository by checking PR comments and reviews, applying the smallest valid fixes, pushing updates, and only merging after review state is clean. Use when a PR is open and you want the review-fix-push loop handled with minimal manual intervention.
compatibility: Requires this repository's GitHub flow scripts, GitHub CLI auth via scripts/with-repo-env.sh, and an open pull request branch.
metadata:
  author: wazaker
  source: local
---

# PR Review Resolver

## Scope

Use this skill when a pull request already exists and the job is to inspect review comments on the PR page, resolve valid findings, push follow-up commits, and continue until the PR is ready to merge.

## Use This Skill For

- checking GitHub PR comments and review messages
- waiting for CodeRabbit or bot review feedback
- resolving valid review findings on the same branch
- committing and pushing follow-up fixes
- deciding whether the PR is ready for merge

## Do Not Use

- before a PR exists
- for planning feature work
- for blind auto-fixing without reading review artifacts
- for merging when review state or conflicts are still unclear

## Required Repo Tools

- `bash ./scripts/pr-watch.sh`
- `bash ./scripts/pr-resolve-review.sh`
- `bash ./scripts/pr-trigger-coderabbit.sh`
- `bash ./scripts/pr-review-cycle.sh`
- `bash ./scripts/pr-thread-sync.sh`
- `bash ./scripts/pr-check-unresolved.sh`
- `bash ./scripts/pr-merge.sh`
- `bash ./scripts/with-repo-env.sh gh ...`

## Workflow

1. Confirm the current branch is a PR branch, not `main`.
2. Ensure GitHub CLI works in repo-local mode through `scripts/with-repo-env.sh`.
3. If CodeRabbit feedback is not present yet, trigger it on the PR.
4. Run `bash ./scripts/pr-watch.sh` to fetch current PR review artifacts into `docs/pr-reviews/`.
5. Run `bash ./scripts/pr-resolve-review.sh` to apply the smallest coherent fixes for valid findings.
6. Run `bash ./scripts/pr-thread-sync.sh` to reply to bot review threads and mark them resolved after fixes are pushed.
7. If fixes were made, let the script commit and push them on the same branch.
8. Repeat the watch and resolve loop until:
   - no valid unresolved findings remain, or
   - the bot has not produced new actionable feedback, or
   - a human decision is required.
9. Merge only when the PR is clean enough to merge and no remaining conflicts or unresolved blocking comments are present.

## Preferred Command

For the normal automated loop, prefer:

```sh
bash ./scripts/pr-review-cycle.sh <pr-number>
```

If the PR number is omitted, the script tries to infer it from the current branch.

## Merge Gate

Before merge:

- confirm the working tree is clean
- confirm the branch has been pushed
- confirm review artifacts do not show new unresolved bot feedback
- confirm `bash ./scripts/pr-check-unresolved.sh` reports zero open review threads
- confirm mergeability via GitHub CLI if available

Then merge with:

```sh
bash ./scripts/pr-merge.sh
```

## Practical Notes

- Review artifacts are generated files under `docs/pr-reviews/` and are not part of source control.
- `pr-resolve-review.sh` uses `codex exec` to perform the actual fix pass, so it should be treated as an agent handoff step.
- If GitHub app reviews are not available, you can still use `bash ./scripts/pr-review.sh committed` for a local CodeRabbit review.
