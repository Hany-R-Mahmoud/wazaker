# Webhook Autonomy Hardening

## Purpose

Close the gap between the repo's intended webhook-driven automation model and the parts that still require live validation outside git-tracked files.

## Repo-Side Changes Now Enforced

- checked-in webhook and support workflows are marked active
- `GhWebhookRouter01` now fans out:
  - `push` -> `CommitSummaryPlane01`
  - `pull_request` -> `PrReviewFirstPass01`
  - `issues` -> `GhIssueTriage01`
  - review-style PR events -> `pr_autofinish`
- repo-local automation skills now include YAML frontmatter
- PR resolver writes a durable blocker report when Codex usage limits interrupt the review loop

## Required Environment Variables

Copy from `.env.automation.example` into the live automation environment and set real values:

- `AUTOMATION_RUNNER_BASE_URL`
- `AUTOMATION_RUNNER_TOKEN`
- `GITHUB_WEBHOOK_SECRET`
- `N8N_WEBHOOK_BASE_URL`

Optional for Plane write-back:

- `PLANE_API_BASE_URL`
- `PLANE_WORKSPACE_SLUG`
- `PLANE_PROJECT_ID`
- `PLANE_API_KEY`

## Required Live Wiring

### GitHub Webhook

Configure the repository webhook to send at least these events:

- `push`
- `pull_request`
- `pull_request_review`
- `pull_request_review_comment`
- `issue_comment`
- `issues`

Use the live `n8n` route that the published workflow actually registers:

- `POST /webhook/GhWebhookRouter01/githubwebhook/github-events`

In this `n8n` version, the production webhook path is not only the short node path from the JSON definition. It is served as:

- `/webhook/<workflowId>/<node-name-lowercased>/<path>`

The GitHub webhook secret must match `GITHUB_WEBHOOK_SECRET` in the live `n8n` environment.

### Internal Fanout Base URL

`N8N_WEBHOOK_BASE_URL` must point at the same live `n8n` instance's webhook base, for example:

- `http://127.0.0.1:5678/webhook`

or the container-reachable equivalent if `n8n` is not calling itself on loopback.

The router's internal fanout now targets the full registered child webhook paths:

- `CommitSummaryPlane01/pushwebhook/github-push-summary`
- `PrReviewFirstPass01/prwebhook/github-pr-first-pass`
- `GhIssueTriage01/issuewebhook/github-issue-triage`

## Validation Checklist

### Workflow Activation

Confirm in the live `n8n` instance that these workflows are imported and active:

- `GhWebhookRouter01`
- `CtxMgrRefresh01`
- `HealthMonitor01`
- `CommitSummaryPlane01`
- `GhIssueTriage01`
- `PrReviewFirstPass01`
- `SpeechQa01`
- `UiConsistency01`
- `ErrorRecovery01`

### Webhook Fanout

Confirm all four routes end to end:

1. send a signed `push` delivery to `/webhook/GhWebhookRouter01/githubwebhook/github-events` and verify `docs/automation/github-commit-summaries/`
2. send a signed `pull_request` delivery to `/webhook/GhWebhookRouter01/githubwebhook/github-events` and verify `docs/automation/pr-first-pass/`
3. send a signed `issues` delivery to `/webhook/GhWebhookRouter01/githubwebhook/github-events` and verify `docs/automation/issue-triage/`
4. send a signed review event to `/webhook/GhWebhookRouter01/githubwebhook/github-events` and verify a `pr_autofinish` job is queued under `.automation/jobs/`

### Secret Validation

Confirm both cases:

- valid signature is accepted
- invalid signature is rejected with `401`

### Codex Interruption Hardening

Force or simulate a resolver failure and verify:

- `scripts/pr-resolve-review.sh` writes `docs/pr-reviews/<branch>-resolver-status.md`
- exit code `75` is returned on Codex-usage-limit blocking
- the merge flow stops instead of silently continuing

## Current Trust Statement

After the repo-side fixes in this branch, the design is aligned with the intended event-driven model.

Do not claim full autonomy until the live validations above are complete in `n8n`, GitHub webhook settings, and runner environment configuration.
