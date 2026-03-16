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

### 6. Resolve review comments on the same branch

If review artifacts were fetched and you want an automated fix loop:

```sh
bash ./scripts/pr-resolve-review.sh
```

This reads the saved PR review artifacts, runs a Codex fix pass, then commits and pushes if changes were made.

### 7. Merge and sync main

```sh
bash ./scripts/pr-merge.sh
```

If `gh` is unavailable, merge in GitHub, then run:

```sh
bash ./scripts/main-sync.sh
```

## Notes

- `GH_TOKEN` in the environment can interfere with `gh` authentication checks. The scripts call `gh` with `GH_TOKEN` unset.
- CodeRabbit review on GitHub depends on the repo/app integration. If the GitHub app review does not trigger automatically, use `./scripts/pr-review.sh`.
- `./scripts/pr-watch.sh` and `./scripts/pr-merge.sh` require clean `gh` authentication.
- `./scripts/pr-resolve-review.sh` depends on review artifacts already fetched to `docs/pr-reviews/`.
