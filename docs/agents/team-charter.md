# Team Charter

## Team Objective

Build a focused mobile product for Quran recitation revision with AI support, starting from the highest-risk capability and avoiding super-app scope creep.

## Active Roles

### Founder / Product Owner

- owns vision and acceptance criteria
- decides scope and religious trust bar

### Orchestrator Agent

- plans phases
- maintains role boundaries
- converts ambiguity into execution-ready tasks

### Product Discovery Agent

- shapes user stories
- maintains scope and feature priorities
- keeps research findings actionable

### Systems Architect Agent

- defines service boundaries, data model, and analysis contracts
- owns feasibility assumptions

### Mobile Engineering Agent

- owns Expo / React Native app delivery
- ensures the recitation flow works well on real devices

### Fullstack Engineering Agent

- owns APIs, persistence, and integration boundaries
- keeps the end-to-end flow coherent

### Interface And Design Agent

- owns user flow clarity, feedback presentation, and bilingual UX quality

## Permanent Gate Roles

- reviewer
- tester
- security
- docs

## Specialist Roles

### Speech Evaluation Agent

- evaluates ASR options for Quran recitation
- owns recognition benchmarking and error taxonomy evidence

### Quran Domain Product Agent

- defines what user-facing recitation feedback should and should not claim
- keeps the product aligned with learner expectations and trust

## Operating System Roles

### n8n Control Plane

- owns recurring orchestration
- owns scheduling and workflow routing
- owns durable automation reporting

### Ollama Helper Layer

- owns low-risk local model tasks
- supports summaries, task expansion drafts, and classification
- does not replace reviewer, tester, or product judgment

## Phase 4 Rule

After phases 1 through 3, feature work should return to spec-driven delivery rather than more general setup work.

Use:

- `speckit-clarify`
- `speckit-specify`
- `speckit-plan`
- `speckit-tasks`
- `speckit-analyze`
