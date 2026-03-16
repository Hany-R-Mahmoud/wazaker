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
./scripts/pr-start.sh setup-pr-workflow
```

### 2. Work normally on the branch

- make code or docs changes
- run relevant checks

### 3. Optional CodeRabbit review

```sh
./scripts/pr-review.sh committed
```

Use `uncommitted`, `committed`, or `all`.

### 4. Publish branch and create PR

```sh
./scripts/pr-publish.sh "feat: add recorder shell" "feat: add recorder shell"
```

If `gh` is not authenticated, the script will still push and print the manual PR URL.

### 5. Resolve review comments on the same branch

- commit fixes
- rerun checks
- push updates

### 6. Merge and sync main

```sh
./scripts/pr-merge.sh
```

If `gh` is unavailable, merge in GitHub, then run:

```sh
./scripts/main-sync.sh
```

## Notes

- `GH_TOKEN` in the environment can interfere with `gh` authentication checks. The scripts call `gh` with `GH_TOKEN` unset.
- CodeRabbit review on GitHub depends on the repo/app integration. If the GitHub app review does not trigger automatically, use `./scripts/pr-review.sh`.
