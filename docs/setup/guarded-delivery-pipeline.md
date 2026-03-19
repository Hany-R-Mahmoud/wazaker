# Guarded Delivery Pipeline

## Purpose

This pipeline is the bridge between the automation foundation and real feature delivery.

Its job is to move a Plane task through:

1. intake
2. branch preparation
3. guarded implementation
4. PR publication
5. automated review handling
6. merge and unlock

## Design Goal

Automate the flow without removing the safety rails.

The pipeline is intentionally conservative. Refusing unsafe work is part of the design, not a failure.

## Repo Scripts

### Preparation

- `scripts/delivery-prepare-task.sh`

Responsibilities:

- require clean `main`
- refuse if a delivery lock already exists
- create the delivery branch
- create the run directory and task brief
- acquire the delivery lock

### Implementation

- `scripts/delivery-implement-task.sh`

Responsibilities:

- read the task brief
- invoke `codex exec` in a scoped prompt
- run lightweight validation
- record the execution result

### Publication

- `scripts/delivery-publish-task.sh`

Responsibilities:

- publish the branch through the existing PR script
- preserve the run metadata
- hand the PR back to the standard PR automation flow

## Lock Model

Only one delivery run may be active at a time.

The lock file lives at:

- `.automation/delivery-lock.json`

The lock is acquired during preparation and released after merge.

## n8n Workflow

Workflow ID:

- `PlnGuardedDelivery01`

Responsibilities:

- inspect Plane work items
- reject shallow or unsafe tasks
- reject dirty repo state
- choose one guarded candidate
- call delivery prepare
- call delivery implement
- call delivery publish
- queue `pr_autofinish`
- write a durable delivery run report

## Task Intake Rules

The workflow only accepts tasks when all of the following are true:

- the Plane item is a task, not a story or epic
- the item is not completed
- the description includes acceptance criteria
- the description includes repo metadata
- the repo is on clean `main`
- no other delivery run is currently active

## Current Validation Gate

Current automated validation is intentionally lightweight:

- `npx tsc --noEmit` when available

This is enough for guarded automation today, but not the final target.

As the app grows, add:

- lint
- unit tests
- focused mobile checks

## Review And Merge Path

After PR publication, the existing repo-owned PR automation takes over:

- `pr_summary`
- `pr_watch`
- `pr_trigger_coderabbit`
- `pr_review_cycle`
- `pr_thread_sync`
- `pr_check_unresolved`
- `pr_autofinish`

This keeps one source of truth for PR behavior.

## Outputs

Every run writes local durable artifacts under:

- `docs/automation/delivery-runs/`

Typical files include:

- task brief
- metadata
- execution report
- publish report
- pipeline summary

## Phase 4 Relationship

This pipeline is for implementation-ready work.

It should not be fed vague ideas.

Phase 4 should route product work through spec-kit first, then send implementation-ready tasks into this delivery system.
