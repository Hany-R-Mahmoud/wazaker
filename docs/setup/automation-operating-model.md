# Automation Operating Model

## Purpose

This document defines the live operating model for the `wazaker` automation layer.

## Status Note

This file describes the checked-in automation baseline and the repo-owned workflow model.

After the 2026-03-22 refactor reset, the target runtime direction is:

- VPS-hosted `n8n`
- Groq-backed OpenClaw
- self-hosted Supabase
- Whisper.cpp on the VPS

Use this document together with:

- `docs/architecture/infrastructure.md`
- `docs/product/roadmap-v2.md`

Treat the local-only details below as the current baseline and migration source, not the final production architecture.

Use it to answer three questions quickly:

1. what `n8n` owns
2. what the repo scripts still own
3. where durable automation evidence lives

## Ownership Boundaries

### n8n

`n8n` is the orchestrator.

It owns:

- schedules
- workflow sequencing
- integration routing
- task selection logic
- durable automation reporting
- calling the local runner and Ollama

It does not own:

- product truth
- architecture truth
- direct code reasoning beyond narrow workflow prompts
- merge judgment without the existing repo guards

### automation-runner

The local `automation-runner` is the bridge between `n8n` and the repository.

It owns:

- exposing approved repo actions through token-protected HTTP endpoints
- job execution and status persistence in `.automation/jobs/`
- durable runtime report writing into `docs/automation/`

### Repo Scripts

The repo scripts remain the source of truth for operational behavior.

They own:

- PR creation and publication
- review watch and review resolution loops
- merge guards
- Plane sync and dedupe behavior
- guarded delivery-branch preparation and publication

### Ollama

Local `Ollama` is now a developer-side helper layer for low-risk automation tasks and local Codex sessions.

It owns:

- summarization
- shallow-task expansion drafts
- lightweight classification
- automation report generation

It does not own:

- final merge approval
- blind code changes outside the guarded delivery pipeline
- learner-facing religious-trust decisions
- production recitation scoring

## Durable Output Paths

Automation output is durable only if it lands outside transient `n8n` execution history.

Current runtime output paths:

- `docs/automation/daily-plane-summaries/`
- `docs/automation/backlog-audits/`
- `docs/automation/plane-task-expansions/`
- `docs/automation/github-pr-automation/`
- `docs/automation/github-pr-summaries/`
- `docs/automation/github-pr-sweeps/`
- `docs/automation/main-clean-check/`
- `docs/automation/delivery-runs/`
- `docs/automation/maintenance/`

These are local runtime artifacts and are intentionally git-ignored.

## Live Workflow Map

### `DpSmryDurable03` — Daily Plane Summary Managed V2

- trigger: daily at `09:00`
- inputs: Plane work items
- helpers: `qwen3:8b`
- output: `docs/automation/daily-plane-summaries/YYYY-MM-DD.md`

### `PlnBklgAudit02` — Plane Backlog Quality Audit V2

- trigger: daily at `09:15`
- inputs: Plane work items
- helpers: local code-only audit logic
- output: `docs/automation/backlog-audits/YYYY-MM-DD.md`

### `PlnTaskExpand01` — Plane Task Expansion Assistant

- trigger: daily at `09:20`
- inputs: Plane work items
- helpers: `qwen3:8b`
- output: `docs/automation/plane-task-expansions/YYYY-MM-DD.md`

### `ProjAutoMaint01` — Project Automation Maintenance

- trigger: daily at `09:30`
- inputs: repo-local backlog mirror and Plane credentials
- helpers: `plane_sync_backlog`, `plane_dedupe_backlog`
- output: `docs/automation/maintenance/YYYY-MM-DD.md`

### `GhPrAutoSup01` — GitHub PR Automation Supervisor

- trigger: every `10` minutes
- inputs: repo status from `automation-runner`
- helpers: `pr_publish`, `pr_autofinish`
- output: `docs/automation/github-pr-automation/`

### `GhPrSmry01` — GitHub PR And Commit Summary

- trigger: every `2` hours
- inputs: repo status from `automation-runner`
- helpers: `pr_summary`
- output: `docs/automation/github-pr-summaries/`

### `GhOpenPrSweep01` — GitHub Open PR Sweep

- trigger: every `1` hour
- inputs: repo status from `automation-runner`
- helpers: `pr_sweep_open`
- output: `docs/automation/github-pr-sweeps/`

### `MainCleanCheck01` — Main Clean Check

- trigger: every `1` hour
- inputs: repo status from `automation-runner`
- helpers: `promote_main_changes`, `pr_sweep_open`
- output: `docs/automation/main-clean-check/`

### `PlnGuardedDelivery01` — Plane Guarded Delivery Pipeline

- trigger: every `4` hours
- inputs: Plane work items and repo status
- helpers: `delivery_prepare_task`, `delivery_implement_task`, `delivery_publish_task`, `pr_autofinish`
- output: `docs/automation/delivery-runs/`

## Checked-In Extension Workflow Map

These workflow definitions are stored in `automation/n8n/` as exported JSON and should remain under version control as the repo source of truth. Their live runtime state still must be validated and activated in `n8n` after import or re-import:

- `CtxMgrRefresh01` — Context Manager Refresh
- `HealthMonitor01` — Automation Health Monitor
- `GhWebhookRouter01` — GitHub Webhook Router
- `CommitSummaryPlane01` — Commit Summarizer Plane Sync
- `GhIssueTriage01` — GitHub Issue Triage
- `PrReviewFirstPass01` — PR Review First Pass
- `PlnTaskDecomp01` — Plane Task Decomposer Writeback
- `PlnStaleTask01` — Plane Stale Task Detector
- `SprintRetro01` — Sprint Retrospective
- `ReleaseNotes01` — Release Notes Generator
- `SpeechQa01` — Speech QA Regression
- `UiConsistency01` — UI Consistency Audit
- `ErrorRecovery01` — Error Recovery Agent
- `GhOpenPrSweep01` — GitHub Open PR Sweep
- `MainCleanCheck01` — Main Clean Check

Live validation checklist: [webhook-autonomy-hardening.md](./webhook-autonomy-hardening.md)

## Safety Model

The automation layer must refuse unsafe states.

Current hard safety rules:

- do not act on a dirty working tree
- do not create delivery branches from anything except clean `main`
- do not allow more than one active delivery run at a time
- do not publish or merge without the repo PR scripts
- do not treat transient bot-status comments as real review findings

## Manual Versus Automated Boundary

### Automated now

- recurring Plane summaries
- backlog quality audits
- task expansion drafts
- Plane backlog maintenance
- PR supervision and PR summary refresh
- open PR sweeping and dirty-main promotion into tracked PR branches
- guarded task-intake and branch-prep automation

### Still intentionally human-controlled

- deciding which product feature to build next
- approving expanded task drafts before they become canonical truth
- reviewing risky code changes
- accepting learner-facing trust claims
- deciding when to start phase 4 feature work

## Failure Handling

When debugging the system, inspect in this order:

1. `n8n` execution history for the failing workflow
2. `.automation/jobs/*.json`
3. `.automation/runner.log`
4. durable reports under `docs/automation/`
5. repo docs if the failure came from bad task quality rather than automation behavior

## Relationship To Plane

Plane is the execution mirror.

This document plus the repo-side automation files are canonical.
Plane work items should summarize this work and point back to the repo artifacts when needed.
