# Agent Operating Model

## Purpose

This document defines the permanent operating model for human-led work, Codex skills, local open-source helpers, and `n8n`.

Use it as the team contract before phase 4 feature work starts.

## Control Layers

### Founder / Product Owner

Owns:

- vision
- scope
- trust bar
- final product decisions

### Codex + Skills

Own the high-judgment engineering work.

Use Codex and repo skills for:

- feature planning
- implementation
- architecture
- debugging
- review judgment
- testing strategy
- documentation updates

### n8n

Owns orchestration and recurring operations.

Use `n8n` for:

- schedule-based tasks
- integration routing
- PR supervision
- delivery intake
- maintenance workflows
- durable operational reporting

### Ollama Helpers

Own low-risk supporting intelligence.

Use local open-source models for:

- summaries
- categorization
- shallow-task expansion drafts
- report writing
- simple candidate ranking

Do not use them as the final authority for:

- code correctness
- merge approval
- product trust claims
- learner-facing evaluation logic

## Permanent Roles

### Core Roles

- orchestrator
- product-discovery
- systems-architect
- mobile-engineering
- fullstack-engineering
- interface-and-design

### Permanent Gates

- reviewer
- tester
- security
- docs

These roles are not optional. They may not all act on every task, but they remain part of the system.

### Specialist Roles

- speech-evaluation
- quran-domain-product

These are now real parts of the team model, not “future maybe” roles.

## Tool Routing

### Use Codex Skills When

- the task changes source code
- the task changes architecture
- tradeoffs matter
- correctness matters more than speed
- repo context must be read deeply

### Use Ollama When

- the task is repetitive
- the output is advisory rather than authoritative
- the work benefits from a draft or summary first
- the prompt is narrow and bounded

### Use n8n When

- work must recur
- work depends on multiple tools
- timing, branching, or retries matter
- you want durable operational traces

## Delivery Routing Rules

### Product / Scope Questions

Route to:

- product-discovery
- quran-domain-product when user trust or religious clarity matters

### System / Integration Questions

Route to:

- systems-architect
- fullstack-engineering when APIs or service boundaries are involved

### Mobile UX And App Behavior

Route to:

- mobile-engineering
- interface-and-design

### Evaluation And ASR Feasibility

Route to:

- speech-evaluation
- systems-architect

### Completion Gates

Route to:

- reviewer
- tester
- security when trust boundaries or secrets are involved
- docs whenever canonical repo truth changes

## Plane Alignment

Plane owner labels should mirror this document exactly.

Current expected owner labels:

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

## Phase 4 Entry Rule

Phase 4 starts when:

1. the automation operating model is documented
2. the guarded delivery pipeline exists
3. the team routing model is documented
4. the next product feature is ready to enter the spec-kit flow

Once those are true, product work should follow:

1. `speckit-clarify`
2. `speckit-specify`
3. `speckit-plan`
4. `speckit-tasks`
5. `speckit-analyze`
6. implementation and gated review
