# Agent Operating Model

## Purpose

This document defines the operating model for human-led work, Codex skills, VPS agents, and automation workflows after the 2026-03-22 refactor reset.

## Control Layers

### Founder / Product Owner

Owns:

- scope
- trust bar
- human gates
- final product decisions
- final merge and release approval

### Codex + Skills

Own high-judgment repo work:

- planning
- implementation
- architecture
- debugging
- review judgment
- testing strategy
- documentation

### OpenClaw

Owns Groq-backed agent command on the VPS target runtime.

Use OpenClaw for:

- routed agent execution
- long-running remote reasoning tasks
- agent-command orchestration above raw `n8n` workflows

### n8n

Owns orchestration and recurring operations.

Use `n8n` for:

- webhooks
- scheduled tasks
- workflow branching and retries
- scoring automation
- GitHub and Plane routing
- durable operational reporting

### Groq Runtime

Owns external reasoning support for:

- planning
- decomposition
- summaries
- PR review when allowed
- light operational text generation

Groq must not receive user recitation audio or other sensitive learner audio payloads.

### Local Ollama Helpers

Own low-risk local support for Codex sessions and developer workflows only.

They are not part of the target production recitation pipeline.

## Permanent Roles

### Core Roles

- orchestrator
- product-discovery
- systems-architect
- mobile-engineering
- fullstack-engineering
- interface-and-design
- infrastructure-operations
- data-foundation
- automation-operations

### Permanent Gates

- reviewer
- tester
- security
- docs

### Specialist Roles

- speech-evaluation
- quran-domain-product

## Routing Rules

### Product / Scope

Route to:

- product-discovery
- quran-domain-product when learner trust or religious clarity matters

### Architecture / Boundaries

Route to:

- systems-architect
- fullstack-engineering for app-to-backend boundary implementation

### Mobile Delivery

Route to:

- mobile-engineering
- interface-and-design

### VPS / Runtime / Services

Route to:

- infrastructure-operations
- automation-operations when service orchestration is workflow-driven

### Quran Data / Reference Content

Route to:

- data-foundation

### Evaluation And ASR Quality

Route to:

- speech-evaluation
- systems-architect

### Completion Gates

Route to:

- reviewer
- tester
- security
- docs

## Plane Alignment

Plane owner labels should mirror this document exactly.

Current expected owner labels:

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

## Operating Rules

- The repo is not greenfield. Audit before replacing.
- Preserve the analysis-service interface contract.
- Keep `npm test` and `npm run typecheck` green after implementation tasks.
- Do not let low-confidence AI output become definitive learner-facing correction.
- Keep user audio inside the VPS-controlled runtime.

## Execution Order

Use the roadmap order in `docs/product/roadmap-v2.md`.

Do not start a downstream epic until upstream blockers are cleared.
