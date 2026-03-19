# GitHub Flow

## Standard Branch Policy

- `main` stays releasable
- all work starts from a new `codex/*` branch
- all changes land through pull requests
- review feedback is resolved on the feature branch
- merge to `main` only after approval
- local `main` is synced after merge

## Default Script Flow

### 1. Start a branch from clean `main`

```sh
bash ./scripts/pr-start.sh setup-pr-workflow
```

### 2. Work normally on the branch

- make code or docs changes
- run relevant checks

### 3. Optional local CodeRabbit review before PR

```sh
bash ./scripts/pr-review.sh committed
```

Use `uncommitted`, `committed`, or `all`.

### 4. Publish branch and create PR

```sh
bash ./scripts/pr-publish.sh "feat: add recorder shell" "feat: add recorder shell"
```

This now auto-generates an appealing PR body in `docs/pr-reviews/` and uses it when creating the PR.

If `gh` is not authenticated, the script will still push and print the manual PR URL plus the generated PR body file.

### 5. Wait for GitHub-side review feedback

```sh
bash ./scripts/pr-watch.sh
```

This polls the current branch PR and saves review artifacts into `docs/pr-reviews/`.
The workflow now uses `agent-reviews` to store only actionable bot comments, while ignoring CodeRabbit status noise such as "Review triggered" comments.
It also enforces a review settle window and, by default, requires actual CodeRabbit or Qodo activity before a PR can auto-merge. Silence is no longer treated as success, because late bot comments can otherwise appear only after the merge.
The default settle window is now `600` seconds and can be changed with `REVIEW_SETTLE_SECONDS`.
Automatic merge also stays blocked while the CodeRabbit or Qodo status is still pending or marked as review in progress, even if a summary comment has already appeared.
If you intentionally want to allow merges when no bot activity appears, set `REQUIRE_BOT_REVIEW_ACTIVITY=0`, but the project default should stay strict.

If auto-review does not start after the PR is opened, trigger it manually:

```sh
bash ./scripts/pr-trigger-coderabbit.sh 1
```

For the full automated review-fix loop on an open PR:

```sh
bash ./scripts/pr-review-cycle.sh 1
```

This loop now:
- fetches actionable bot feedback through `agent-reviews`
- ignores bot status noise that should not block merge
- writes a review gate artifact at `docs/pr-reviews/<branch>-review-gate.json`
- waits through a 10-minute review settle window, requires real bot activity, and refuses to treat CodeRabbit or Qodo pending status as settled
- replies to actionable bot review threads
- resolves those threads after fixes land
- blocks merge while actionable review threads remain unresolved
- blocks merge until the review gate artifact explicitly reports `clearToMerge=true`

### 6. Resolve review comments on the same branch

If review artifacts were fetched and you want an automated fix loop:

```sh
bash ./scripts/pr-resolve-review.sh
```

This reads the filtered review artifacts, runs a Codex fix pass, then commits and pushes only when real source changes were produced.

To sync GitHub review threads after fixes:

```sh
bash ./scripts/pr-thread-sync.sh 1
```

This uses `agent-reviews --reply ... --resolve` for actionable bot comments.

To verify that the PR has no unresolved review threads before merge:

```sh
bash ./scripts/pr-check-unresolved.sh 1
```

This check now also fails if:
- CodeRabbit or Qodo is still pending
- no bot activity has appeared yet while `REQUIRE_BOT_REVIEW_ACTIVITY=1`
- the review gate artifact is missing or not clear

### 7. Merge and sync main

```sh
bash ./scripts/pr-merge.sh
```

For a single command that waits for review, resolves comments, and merges when clean:

```sh
bash ./scripts/pr-autofinish.sh 1
```

`pr-autofinish` is now expected to stop before merge unless all of these are true:
- bot review is no longer pending
- unresolved human threads are `0`
- unresolved actionable bot threads are `0`
- the saved review gate artifact says `clearToMerge=true`

### 8. Sweep Remaining Open PRs

For a repo-wide pass over open PRs with no human-in-the-middle:

```sh
node ./scripts/pr-open-sweep.mjs
```

This sweep now:
- runs only from clean `main`
- lists open PRs across the repository
- skips drafts and fork-owned branches
- creates a temporary local worktree per eligible PR
- runs the existing `pr-autofinish` flow inside that worktree
- merges only when the existing review gates are satisfied
- writes a durable sweep report under `docs/automation/github-pr-sweeps/`

If `gh` is unavailable, merge in GitHub, then run:

```sh
bash ./scripts/main-sync.sh
```

## n8n Ownership

The recurring version of this flow is now owned by `n8n` through the local `automation-runner`.

Active automation mapping:

- `GitHub PR Automation Supervisor` checks the current branch every `30` minutes
- it runs `pr_publish` when a clean feature branch is ahead of `main` without an open PR
- it runs `pr_autofinish` when an open PR exists for the current branch
- `Plane Guarded Delivery Pipeline` can hand a prepared implementation task into this PR flow after branch preparation and publication
- `GitHub PR And Commit Summary` refreshes repo summary artifacts every `2` hours

Durable automation reports land in:

- `docs/automation/github-pr-automation/`
- `docs/automation/github-pr-summaries/`

The repo scripts remain the source of truth for PR behavior; `n8n` now provides the scheduling, gating, and durable report trail around them.

## Notes

- `wazaker` uses a repo-local `.envrc` that clears `GH_TOKEN` and `GITHUB_TOKEN` through `direnv`, so GitHub CLI behavior in this repo is isolated from your global shell setup.
- CodeRabbit review on GitHub depends on the repo/app integration. If the GitHub app review does not trigger automatically, use `bash ./scripts/pr-review.sh`.
- `.coderabbit.yaml` enables repository-level automatic review behavior once the CodeRabbit GitHub App is installed and authorized for this repository.
- The repo-local skill `.agents/skills/pr-review-resolver/SKILL.md` is the preferred agent entry point for PR-page review handling.
- `bash ./scripts/pr-watch.sh` and `bash ./scripts/pr-merge.sh` require clean `gh` authentication.
- `bash ./scripts/pr-resolve-review.sh` depends on review artifacts already fetched to `docs/pr-reviews/`.
- `bash ./scripts/pr-thread-sync.sh` now uses `agent-reviews` for actionable bot review threads; unresolved human threads still block merge.
- `bash ./scripts/pr-autofinish.sh` is the preferred no-interruption path once a PR is open.
