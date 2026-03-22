# Plane Operating Model

## Purpose

Plane is the execution mirror for `wazaker`. Repo docs remain the canonical source of truth for product, architecture, refactor decisions, and agent rules.

## Source Of Truth Split

- Product truth: `docs/product/`
- Architecture truth: `docs/architecture/`
- Refactor baseline: `docs/refactor/`
- Team and routing truth: `docs/agents/`
- Execution mirror: Plane

## Canonical Backlog Mirror

The current canonical backlog mirror is:

- `docs/product/plane-backlog.json`

It is aligned to:

- `docs/product/roadmap-v2.md`
- `docs/product/tarteel-alignment.md`
- `docs/architecture/infrastructure.md`

## What Lives In Plane

- epics
- tasks
- parent-child relationships
- execution status
- assignee visibility
- labels for owner, workstream, and phase

## What Must Exist In The Repo First

Do not create or rely on Plane-only truth for:

- product scope
- architecture decisions
- scoring safety rules
- refactor keep/replace/retire decisions
- runtime security boundaries

## Assignment Model

- `Assignee`
  Default to the founder / real human operator when personal accountability is needed.

- `Owner label`
  Represent the logical agent or role that owns the workstream.

- `Workstream label`
  Represent the type of work.

## Recommended Owner Labels

- `owner:founder`
- `owner:orchestrator`
- `owner:product-discovery`
- `owner:systems-architect`
- `owner:mobile-engineering`
- `owner:fullstack-engineering`
- `owner:interface-and-design`
- `owner:infrastructure-operations`
- `owner:data-foundation`
- `owner:automation-operations`
- `owner:speech-evaluation`
- `owner:quran-domain-product`
- `owner:reviewer`
- `owner:tester`
- `owner:security`
- `owner:docs`

## Recommended Workstream Labels

- `refactor`
- `new-feature`
- `infra`
- `data`
- `ai-ops`
- `frontend`
- `backend`
- `qa`
- `human-gate`
- `automation`

## Recommended Phase Labels

- `phase-0`
- `phase-1`
- `phase-2`

## Dependency Model

- `parentId` in the backlog mirror is applied as a real Plane parent-child relationship
- `dependsOn` remains in the canonical repo backlog and is mirrored into the Plane description

Until a dedicated dependency-linking API path is implemented in the sync scripts, dependency truth remains repo-canonical first.

## Backlog Flow

1. Update the canonical repo artifact.
2. Update `docs/product/plane-backlog.json`.
3. Generate `docs/product/plane-backlog.csv`.
4. Sync to Plane through `bash ./scripts/plane-sync-backlog.sh`.
5. Use Plane for sequencing, state, and delivery visibility.

## Automation Rule

The sync scripts must not invent product truth. They mirror repo-side truth into Plane.

If a task needs more detail, enrich the repo artifact first, then sync again.
