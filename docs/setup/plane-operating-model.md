# Plane Operating Model

## Purpose

Plane is the execution system for `wazaker`. It is not the product source of truth.

Use this split deliberately:

- GitHub repo docs define truth for product, architecture, research, and decisions.
- Plane mirrors execution work as epics, stories, spikes, and tasks.
- PR branches and merged changes feed status updates back into Plane.

This avoids a common failure mode where backlog details drift away from actual implementation and architecture.

## Source Of Truth

- Vision and MVP scope: `docs/product/`
- Architecture and ADRs: `docs/architecture/`
- Research and evaluation: `docs/research/`
- Design references: `design/`
- Execution mirror: Plane project

## What Lives In Plane

- epics
- user stories
- spikes
- implementation tasks
- bug reports
- phase and milestone status

## What Does Not Live Only In Plane

Do not create product truth only in Plane for:

- acceptance criteria that matter to implementation
- architecture decisions
- ASR evaluation findings
- UX rules for religious-trust-sensitive feedback

Those must exist in the repo first, then be mirrored into Plane.

## Assignment Model

Do not fake separate human accounts for agents in Plane.

Use this model instead:

- `Assignee`
  - default to the founder / actual human operator
  - or leave unassigned if you do not want personal task noise

- `Owner label`
  - represent the agent or role that logically owns the work

- `Lane label`
  - represent the delivery stream

- `Type label`
  - represent epic, story, task, spike, or bug if Plane fields are insufficient

### Recommended Owner Labels

- `owner:orchestrator`
- `owner:product-discovery`
- `owner:systems-architect`
- `owner:mobile-engineering`
- `owner:fullstack-engineering`
- `owner:interface-and-design`
- `owner:speech-evaluation`
- `owner:quran-domain-product`
- `owner:reviewer`
- `owner:tester`
- `owner:security`
- `owner:docs`

### Recommended Lane Labels

- `lane:ops`
- `lane:product`
- `lane:mobile`
- `lane:ai`
- `lane:backend`
- `lane:ux`
- `lane:qa`

### Recommended Phase Labels

- `phase:foundation`
- `phase:mvp`
- `phase:spike`
- `phase:v2`

## Working Agreement

### Orchestrator Agent

- maintains epic structure
- decides sequencing
- opens implementation-ready tasks only after upstream specs exist

### Product Discovery Agent

- owns story quality
- keeps acceptance criteria clear and testable

### Systems Architect Agent

- owns spikes, contracts, and architecture tasks

### Mobile Engineering Agent

- owns Expo app implementation tasks

### Interface And Design Agent

- owns UX, feedback clarity, and bilingual UI tasks

### Reviewer And Tester Agents

- own review, validation, and release-readiness tasks

## Backlog Flow

1. Write or update the canonical repo artifact.
2. Regenerate the Plane backlog export from `docs/product/plane-backlog.json`.
3. Import or sync the generated CSV into Plane.
4. Move only active work into the current milestone / iteration.
5. Tie each PR branch back to a Plane issue ID in the PR summary where practical.

## Automation Model

The repository will automate:

- checked-in backlog structure
- CSV export for Plane import
- role ownership labels
- predictable issue descriptions from repo data

The repository will not assume direct Plane API control until credentials or an integration method are intentionally added.

That is the right constraint today. It keeps execution automated without hiding state in a brittle unofficial integration.

## Current Recommended Setup

- Use `docs/product/plane-backlog.json` as the repo-side canonical backlog mirror.
- Generate `docs/product/plane-backlog.csv` before backlog imports.
- Use Plane for status, sequencing, and execution visibility.
- Keep acceptance criteria and spec details in GitHub docs and link them from Plane items.
