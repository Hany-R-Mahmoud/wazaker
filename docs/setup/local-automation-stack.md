# Local Automation Stack

## Purpose

This document records the local, free automation stack used for `wazaker` project operations.

Use it to keep the setup reproducible and to avoid drifting back to manual-only orchestration.

## Stack

- `Ollama` for local LLM inference
- `Docker Desktop` for local container runtime
- `n8n` for orchestration and scheduling
- local `automation-runner` for safe access to repo scripts from `n8n`
- `Plane` as the execution system
- `Codex + skills` for higher-judgment planning, coding, and review work

## Machine Profile

- Apple Silicon Mac
- `16GB` RAM
- local-first setup
- no paid API dependency required for the current automation path

## Installed Models

- `qwen3:8b`

This is the current default local model for project-summary and orchestration-style tasks.

## Running Services

### Ollama

Start locally when needed:

```bash
ollama serve
```

### n8n

`n8n` runs in Docker with persistent local storage and repo-automation environment variables.

Current container shape:

```bash
docker run -d \
  --name n8n \
  --restart unless-stopped \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  --add-host=host.docker.internal:host-gateway \
  -e 'NODE_FUNCTION_ALLOW_BUILTIN=*' \
  -e N8N_BLOCK_ENV_ACCESS_IN_NODE=false \
  -e GENERIC_TIMEZONE=Africa/Cairo \
  -e PLANE_API_BASE_URL=https://api.plane.so \
  -e PLANE_WORKSPACE_SLUG=wazaker \
  -e PLANE_PROJECT_ID=3bddb944-c6c3-4fe1-aaec-a6b1be247789 \
  -e PLANE_API_KEY=... \
  -e AUTOMATION_RUNNER_BASE_URL=http://host.docker.internal:3210 \
  -e AUTOMATION_RUNNER_TOKEN=... \
  -e GITHUB_WEBHOOK_SECRET=... \
  n8nio/n8n
```

Required runtime notes:

- `NODE_FUNCTION_ALLOW_BUILTIN=*` is required because several checked-in Code nodes use `require('node:http')`, `require('node:https')`, and `require('node:crypto')` for durable local HTTP orchestration.
- `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` is required because the workflows read repo automation settings from `$env`.
- `GITHUB_WEBHOOK_SECRET` must match the GitHub webhook configuration for the router workflow to validate signatures.

### automation-runner

The local `automation-runner` exposes selected repo scripts behind a token-protected HTTP interface so `n8n` can orchestrate them without re-implementing the logic.

Current exposed actions:

- `pr_publish`
- `pr_summary`
- `pr_autofinish`
- `pr_review_cycle`
- `pr_trigger_coderabbit`
- `pr_resolve_review`
- `pr_thread_sync`
- `pr_check_unresolved`
- `pr_merge`
- `plane_sync_backlog`
- `plane_dedupe_backlog`
- `main_sync`

## Workflow Source

Checked-in workflow definitions live in:

- `automation/n8n/`

## Active Workflows

### Daily Plane Summary Managed V2

- workflow id: `DpSmryDurable03`
- schedule: daily at `09:00`
- status: active

### Flow

1. `Schedule Trigger`
2. `Fetch Plane Work Items`
3. `Generate Summary And Write Report`

### Behavior

- fetches the latest Plane work items from the `wazaker` project
- reduces them to a compact project-operation payload
- asks local `Ollama` using `qwen3:8b` for a concise markdown summary
- writes the summary to `docs/automation/daily-plane-summaries/YYYY-MM-DD.md`

### Plane Backlog Quality Audit V2

- workflow id: `PlnBklgAudit02`
- schedule: daily at `09:15`
- status: active

### Flow

1. `Schedule Trigger`
2. `Fetch Plane Work Items`
3. `Audit And Write Report`

### Behavior

- fetches recent Plane work items from the `wazaker` project
- flags shallow descriptions, missing acceptance criteria markers, and missing repo metadata markers
- writes findings to `docs/automation/backlog-audits/YYYY-MM-DD.md`
- reinforces the project rule that Plane work items must not stay shallow

### Plane Task Expansion Assistant

- workflow id: `PlnTaskExpand01`
- schedule: daily at `09:20`
- status: active

### Flow

1. `Schedule Trigger`
2. `Fetch Plane Work Items`
3. `Expand Tasks And Write Report`

### Behavior

- selects the highest-signal shallow or underspecified open Plane items
- asks local `Ollama` to expand them into clearer execution guidance
- writes suggestions to `docs/automation/plane-task-expansions/YYYY-MM-DD.md`
- keeps write-back human-reviewed instead of auto-editing Plane

### Project Automation Maintenance

- workflow id: `ProjAutoMaint01`
- schedule: daily at `09:30`
- status: active

### Flow

1. `Schedule Trigger`
2. `Run Maintenance Scripts`

### Behavior

- runs `plane_sync_backlog`
- runs `plane_dedupe_backlog`
- writes maintenance output to `docs/automation/maintenance/YYYY-MM-DD.md`

### GitHub PR Automation Supervisor

- workflow id: `GhPrAutoSup01`
- schedule: every `30` minutes
- status: active

### Flow

1. `Schedule Trigger`
2. `Inspect Repo And Launch Automation`

### Behavior

- inspects the current branch through the local runner
- runs `pr_publish` when a clean feature branch is ahead of `main` without an open PR
- runs `pr_autofinish` when an open PR exists for the current branch
- writes a durable decision trail to `docs/automation/github-pr-automation/`

### GitHub PR And Commit Summary

- workflow id: `GhPrSmry01`
- schedule: every `2` hours
- status: active

### Flow

1. `Schedule Trigger`
2. `Generate PR And Commit Summary`

### Behavior

- runs the repo `pr_summary` script for the current branch
- records the generated repo artifact path from `docs/pr-reviews/`
- writes an automation-side snapshot to `docs/automation/github-pr-summaries/`

### Plane Guarded Delivery Pipeline

- workflow id: `PlnGuardedDelivery01`
- schedule: every `4` hours
- status: active

### Flow

1. `Schedule Trigger`
2. `Fetch Plane Work Items`
3. `Run Guarded Delivery`

### Behavior

- filters Plane work items down to implementation-ready task candidates
- refuses to run unless the repo is on clean `main`
- prepares a guarded delivery branch through repo scripts
- invokes Codex implementation through the repo delivery scripts
- publishes the PR and queues `pr_autofinish`
- writes the delivery report to `docs/automation/delivery-runs/`

## Extension Workflows

The repo now also includes checked-in workflow definitions for the next automation layer:

- `Context Manager Refresh`
- `Automation Health Monitor`
- `GitHub Webhook Router`
- `Commit Summarizer Plane Sync`
- `GitHub Issue Triage`
- `PR Review First Pass`
- `Plane Task Decomposer Writeback`
- `Plane Stale Task Detector`
- `Sprint Retrospective`
- `Release Notes Generator`
- `Speech QA Regression`
- `UI Consistency Audit`
- `Error Recovery Agent`
- `GitHub Open PR Sweep`

## Validation Completed

- local `Ollama` installation verified
- local `n8n` installation verified
- `n8n -> Ollama` connectivity verified
- `n8n -> Plane` connectivity verified
- `n8n -> automation-runner` connectivity verified from inside the running container
- durable report writing through the runner verified at `docs/automation/smoke-tests/runner-write.md`
- active scheduled workflows imported and published successfully
- checked-in workflow source now lives under `automation/n8n/`

## Current Constraints

- the PR supervisor acts on the repo's currently checked-out branch, so it is designed for this local working copy rather than a hosted multi-branch control plane
- `n8n execute` is not a reliable smoke-test path inside the already-running container because the task broker port is already claimed by the live instance
- Plane expansion suggestions are written to repo reports first and are not auto-posted back into Plane yet
- delivery runtime artifacts are durable locally but intentionally git-ignored
- the previously quarantined Plane polling workflows were hardened, smoke-run, and republished as active; see `docs/setup/plane-workflow-reactivation-2026-03-19.md` for the live reactivation record and the remaining first-scheduled-run validation gap
- repo-wide open PR sweeping requires a valid automation GitHub token because the repo-local `gh` login is intentionally isolated from the human shell session

## Recommended Always-On Baseline

Keep these workflows active when you want low-friction unattended operation:

- daily Plane summary
- backlog quality audit
- task expansion assistant
- project automation maintenance
- context manager refresh
- automation health monitor
- speech QA regression
- UI consistency audit
- sprint retrospective
- release notes generator

These paths are already aligned with env-based auth and runner tokens. They should not require repeated human sign-in once the container env is stable.

## Pause Until GitHub Auth Is Hardened

Pause or treat these as semi-manual until `AUTOMATION_GITHUB_TOKEN`, `GITHUB_WEBHOOK_SECRET`, and webhook routing are verified end to end:

- GitHub PR automation supervisor
- GitHub PR and commit summary
- GitHub webhook router
- PR review first pass
- GitHub issue triage
- GitHub open PR sweep
- Plane guarded delivery pipeline

This keeps the stack useful without forcing GitHub-related sign-in friction into every session.

## n8n UI Login Rule

The `n8n` UI should be treated as an admin console, not as a dependency for normal scheduled execution.

If the UI repeatedly asks for sign-in:

- verify `~/.n8n:/home/node/.n8n` is still mounted on the container
- avoid recreating the container without the same persistent volume
- use one stable browser profile for the local `n8n` session
- fix session persistence first instead of working around it by signing in repeatedly

## Next Recommended Automations

1. observe the first naturally scheduled executions for the reactivated Plane polling workflows and record the results next to the smoke-run note
2. provide `AUTOMATION_GITHUB_TOKEN` to the runner and `n8n` so GitHub automation can run headlessly without depending on repo-local `gh`
3. validate webhook routing with `GITHUB_WEBHOOK_SECRET` and `N8N_WEBHOOK_BASE_URL`
4. add Plane state and label conventions for task decomposition approvals

## Related Docs

- [Automation Operating Model](/Users/hanyramadan/wazaker/docs/setup/automation-operating-model.md)
- [Guarded Delivery Pipeline](/Users/hanyramadan/wazaker/docs/setup/guarded-delivery-pipeline.md)
- [Spec-Kit Readiness](/Users/hanyramadan/wazaker/docs/setup/spec-kit-readiness.md)
- [n8n Auth Hardening Plan](/Users/hanyramadan/wazaker/docs/setup/n8n-auth-hardening-plan-2026-03-19.md)

## Operating Rules

- keep secrets in container environment variables or n8n credentials, not hardcoded node values
- keep repo truth in checked-in docs, then mirror execution state into Plane
- prefer small, single-purpose workflows over one giant agent workflow
- require meaningful descriptions and outcome notes on Plane items
- prefer `n8n` orchestration over ad-hoc recurring script invocation for repo operations
- do not auto-merge while CodeRabbit or Qodo is still pending, while bot threads remain unresolved, or while the saved review gate is not clear
- repo-wide PR sweep may merge only same-repo branches; fork PRs stay report-only until a separate fork-safe path exists
