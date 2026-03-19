# n8n Auth Hardening Plan

**Date**: 2026-03-19
**Goal**: remove as many interactive login blockers as possible from the local automation stack and make the remaining manual steps explicit.

## Outcome Target

- scheduled workflows should run without relying on a human browser session
- GitHub and Plane access should use stable tokens or webhook secrets
- repo scripts should keep human `gh` login as a fallback, not as the unattended default
- any workflow that still depends on interactive approval should be treated as semi-manual and not part of the always-on baseline

## Current Assessment

The checked-in stack is already close to a headless model:

- Plane polling workflows use `PLANE_API_KEY`
- runner-backed workflows use `AUTOMATION_RUNNER_TOKEN`
- GitHub webhook routing uses `GITHUB_WEBHOOK_SECRET`
- repo-wide PR sweeping uses `AUTOMATION_GITHUB_TOKEN`

The main remaining blockers are operational rather than architectural:

- unattended GitHub actions still need a dedicated automation token to avoid falling back to human `gh` auth
- the local `n8n` UI session itself can become a distraction if container storage or browser sessions are unstable
- some repo scripts still document human `gh` login because they are dual-use for both manual and automated flows

## Execution Plan

### Phase 1: Freeze the Always-On Baseline

Keep only headless-ready workflows in the default always-on set:

- `DpSmryDurable03`
- `PlnBklgAudit02`
- `PlnTaskExpand01`
- `ProjAutoMaint01`
- `HealthMonitor01`
- `CtxMgrRefresh01`
- `SpeechQa01`
- `UiConsistency01`
- `SprintRetro01`
- `ReleaseNotes01`

These workflows are runner- or Plane-driven and do not inherently require an interactive browser login once env vars are configured.

### Phase 2: Harden GitHub Automation

Require these values for unattended GitHub work:

- `AUTOMATION_GITHUB_TOKEN`
- `GITHUB_WEBHOOK_SECRET`
- `N8N_WEBHOOK_BASE_URL`
- `AUTOMATION_RUNNER_TOKEN`

Treat these workflows as headless only after the token path is validated:

- `GhPrAutoSup01`
- `GhPrSmry01`
- `GhWebhookRouter01`
- `PrReviewFirstPass01`
- `GhIssueTriage01`
- `n8n-github-open-pr-sweep.json`

If the token path is not validated yet, pause GitHub automation and continue product work manually through the repo scripts.

### Phase 3: Make the Manual Boundary Explicit

Mark these actions as semi-manual until validated in your environment:

- posting GitHub PR comments from `n8n`
- repo-wide open PR sweeping
- webhook-triggered PR review automation
- any script path that still depends on repo-local `gh` state instead of `AUTOMATION_GITHUB_TOKEN`

### Phase 4: Stabilize the n8n UI Session

If `n8n` keeps asking for sign-in again:

1. verify the container keeps mounting `~/.n8n:/home/node/.n8n`
2. avoid recreating the container without the same persistent volume
3. prefer one stable browser profile for the local `n8n` UI
4. treat the UI as an admin console, not as part of normal scheduled execution

## Workflow Auth Matrix

| Workflow / Path | Primary Auth Model | Interactive Blocker Risk | Recommended Mode |
| --- | --- | --- | --- |
| Daily Plane Summary | `PLANE_API_KEY` + runner token | Low | Always-on |
| Plane Backlog Quality Audit | `PLANE_API_KEY` + runner token | Low | Always-on |
| Plane Task Expansion Assistant | `PLANE_API_KEY` + runner token | Low | Always-on |
| Project Automation Maintenance | `PLANE_API_KEY` + runner token | Low | Always-on |
| Context Manager Refresh | runner token | Low | Always-on |
| Automation Health Monitor | runner token | Low | Always-on |
| Speech QA Regression | runner token | Low | Always-on |
| UI Consistency Audit | runner token | Low | Always-on |
| Sprint Retrospective | runner token | Low | Always-on |
| Release Notes Generator | runner token | Low | Always-on |
| GitHub PR Automation Supervisor | runner token plus downstream GitHub token path | Medium | Enable after GitHub token validation |
| GitHub PR And Commit Summary | runner token plus repo GitHub access | Medium | Enable after GitHub token validation |
| GitHub Webhook Router | webhook secret + runner token | Medium | Enable after webhook validation |
| PR Review First Pass | runner token plus downstream GitHub comment path | Medium | Enable after GitHub token validation |
| GitHub Issue Triage | webhook secret + runner token | Medium | Enable after GitHub token validation |
| GitHub Open PR Sweep | `AUTOMATION_GITHUB_TOKEN` | High if missing | Pause until token validated |
| Plane Guarded Delivery Pipeline | Plane API + runner + downstream GitHub automation | High | Keep semi-manual until GitHub path is stable |
| Plane Task Decomposer Writeback | Plane API + writeback policy | Medium | Semi-manual until approval/writeback rules are finalized |

## Immediate Actions Completed In This Pass

- recorded the auth-hardening plan in repo docs
- documented which workflows should remain always-on
- documented which GitHub flows should be paused until token validation is complete
- tightened setup docs so auth blockers are visible earlier

## Remaining Manual Validation

1. verify `AUTOMATION_GITHUB_TOKEN` can list and comment on PRs without your shell session
2. verify webhook delivery reaches `GhWebhookRouter01` using `GITHUB_WEBHOOK_SECRET`
3. verify `n8n` login survives container restart with the same `~/.n8n` mount
4. only then move GitHub automation from semi-manual to always-on
