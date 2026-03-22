# Refactor Planning Handoff

Date: 2026-03-22  
Project: `wazaker`  
Audience: human stakeholders and the AI agent preparing the next refactor plan

## Purpose

This document summarizes the current state of the `wazaker` project before a new refactor plan is formulated.

It is intended to help the next planning agent answer four questions quickly:

1. What has already been established and should be treated as real project foundation?
2. What has already been implemented versus only planned?
3. Which tools, AI systems, and human roles are part of the current operating model?
4. What should the next refactor-planning pass reconsider now that product targets have changed?

## Executive Summary

`wazaker` currently has two substantial foundations:

- a focused product direction around AI-assisted Quran recitation revision
- a fairly mature project operating system for AI-assisted execution, PR automation, backlog sync, and guarded delivery

On the product side, the repo is still centered on the original Phase 1 MVP assumption:

- select a constrained Quran target
- record recitation
- send or simulate analysis
- show confidence-aware feedback
- retry and preserve local session history

On the implementation side, the mobile app already contains a working shell for that flow:

- Expo / React Native app bootstrapped
- navigation between target selection and recording screens
- bilingual copy and theme foundations
- typed recitation domain model with Zod validation
- mock analysis service boundary
- local session-history repository
- recitation session provider and state orchestration
- fixture-backed mock analysis results
- passing unit / component tests around the current foundations

On the operations side, the repo already includes a strong automation and agent framework:

- documented human and AI role model
- `n8n` orchestration
- `automation-runner` bridge
- local `Ollama` support
- guarded Plane-to-PR delivery flow
- PR review and merge automation scripts

This means the next refactor plan should not start from zero. It should treat the current system as a real baseline and decide what to keep, simplify, replace, or defer.

## What The Project Is Trying To Build

The current documented product goal is:

> a mobile app that helps Quran learners revise and assess recitation with AI support

Core product principles already established in repo docs:

- trust first
- mobile first
- focused recitation workflow over super-app scope
- clear and learner-safe feedback
- Arabic-first with English support

Current explicit non-goals for V1:

- prayer times
- qibla
- azkar
- social features
- commerce
- teacher marketplace
- advanced tajweed scoring
- broad Islamic utility-app expansion

## Foundations Established So Far

### 1. Product Foundation

These documents already define the original delivery direction:

- `README.md`
- `docs/product/vision.md`
- `docs/product/mvp-scope.md`
- `docs/product/user-stories.md`
- `specs/001-recitation-mvp-spec/spec.md`
- `specs/001-recitation-mvp-spec/plan.md`
- `specs/001-recitation-mvp-spec/tasks.md`

The current product baseline is a constrained recitation-revision MVP, not a broad app.

### 2. Mobile App Foundation

The repo already has a real Expo / React Native codebase, not just planning docs.

Current technical stack:

- TypeScript 5.9
- React 19
- React Native 0.83
- Expo SDK 55
- React Navigation 7
- Expo AV
- Zod
- Jest
- React Native Testing Library
- ESLint

Current app structure follows the documented feature-first and MCVM-style direction:

- `src/app/`
- `src/features/recitation/`
- `src/shared/`
- `src/tests/`

### 3. AI / Analysis Foundation

The project already established an important architectural principle:

- the mobile app and the recitation-analysis logic should stay separated by a narrow contract

This is reflected in:

- `docs/architecture/system-overview.md`
- `docs/architecture/audio-pipeline.md`
- `docs/architecture/data-model.md`
- `specs/001-recitation-mvp-spec/contracts/analysis-service.openapi.yaml`
- `src/features/recitation/services/analysis-service.ts`
- `src/features/recitation/services/submit-recitation-attempt.ts`

This separation is one of the most valuable foundations in the repo and should be preserved unless there is a very strong reason to collapse it.

### 4. AI Operations / Delivery Foundation

The repo also already includes a substantial AI-assisted operating system:

- documented team charter and role routing
- documented control-plane split between humans, Codex, `n8n`, and `Ollama`
- checked-in workflow definitions under `automation/n8n/`
- delivery / PR / sync scripts under `scripts/`
- guarded delivery pipeline docs
- local automation stack docs

This is more advanced than a typical early-stage app repo and should be treated as a strategic asset.

## What Has Been Achieved So Far

### A. Product And Planning Achievements

- Defined the product vision and MVP scope for AI-guided Quran recitation revision.
- Created user stories and acceptance criteria for target selection, recording, analysis, feedback, retry, and local history.
- Produced a full Spec-Kit artifact set for the recitation MVP:
  - spec
  - implementation plan
  - research
  - data model
  - quickstart
  - tasks
- Documented architecture boundaries for the mobile client, recitation analysis layer, and future backend responsibilities.
- Documented ASR feasibility strategy instead of pretending the recognition problem is already solved.

### B. Mobile Implementation Achievements

The following are implemented in code today:

- App root and provider setup
- Recitation navigation shell
- Target selection screen
- Recording screen shell
- Recitation session provider
- Session-history repository with local-storage-style persistence abstraction
- Typed recitation entities and schemas
- Shared bilingual copy helpers
- Shared visual theme for the recitation flow
- Fixture-backed analysis adapter and mapping layer
- Mock review submission path from the recording screen

Important current implementation files:

- `src/app/controllers/app-controller.tsx`
- `src/app/navigation/recitation-navigator.tsx`
- `src/app/providers/app-providers.tsx`
- `src/features/recitation/screens/target-selection-screen.tsx`
- `src/features/recitation/screens/recording-screen.tsx`
- `src/features/recitation/hooks/use-recitation-session.tsx`
- `src/features/recitation/storage/session-history.ts`
- `src/features/recitation/services/analysis-service.ts`
- `src/features/recitation/services/submit-recitation-attempt.ts`
- `src/features/recitation/models/recitation-fixtures.ts`
- `src/features/recitation/types/`
- `src/shared/i18n/`
- `src/shared/theme/`

### C. Validation Achievements

Verification run on 2026-03-22:

- `npm test`: passed
- `npm run typecheck`: passed

Current automated coverage includes:

- schema validation tests
- type-shape tests
- fixture mapping tests
- session-history tests
- shared foundation tests
- recording-screen behavior tests

### D. ASR / AI Research Achievements

The repo has already done real feasibility work rather than staying theoretical:

- defined an ASR evaluation plan
- shortlisted provider options
- built local benchmark tooling
- ran a local `whisper.cpp` baseline
- documented findings and safety interpretation

Key current conclusion:

- the local baseline is useful for experimentation
- it is not yet trustworthy enough for learner-facing correction claims

That is a major planning input for the next refactor. The app may continue with mock analysis boundaries, but the AI core is still evidence-gated.

### E. Automation / Operating System Achievements

The project has already built a strong execution platform around the codebase:

- local automation stack defined
- `n8n` workflow library checked into the repo
- `automation-runner` bridge for safe script execution
- Plane backlog sync and dedupe support
- guarded delivery pipeline
- PR publish / review / merge automation
- daily summaries and backlog-quality workflows
- agent roster and operating model docs

This means the project is not only a mobile app repo; it is also a semi-automated delivery system.

## Current State Of The Codebase

### Implemented And Working

- project bootstrapping and dependency setup
- feature-first source layout
- recitation theme and bilingual copy foundations
- recitation types and schemas
- analysis-service abstraction
- target selection UI using fixture data
- recording flow shell with permission handling
- mock result submission flow
- session-state orchestration
- local session-history storage abstraction

### Implemented But Still Shell-Level

- recording logic is still UX-shell level, not full production audio capture orchestration
- analysis is still fixture-backed mock behavior, not a real ASR-backed service
- feedback rendering currently stops at summary-level output in the recording screen, not a dedicated final result experience
- local persistence exists as a generic repository abstraction and browser-like storage fallback, but not yet as a mobile-native persistence strategy

### Planned But Not Yet Fully Delivered

- dedicated result screen
- retry flow from the result screen
- fully rendered mismatch breakdown UX
- stronger low-confidence feedback UI patterns
- production analysis backend integration
- finalized canonical Quran content integration
- stronger observability and release-readiness around the mobile product slice

## Important Reality Check: Tasks File And Code Are Slightly Out Of Sync

The planning agent should not rely on `specs/001-recitation-mvp-spec/tasks.md` as a literal implementation ledger.

Examples:

- `T008` and `T009` still appear unchecked in the task list, but session history and navigation/session state already exist in code.
- parts of the recording flow and mock submission path are implemented even though the task list still frames them as pending.

Interpretation:

- the codebase is ahead of the checklist in some areas
- the next refactor plan should re-baseline from actual code, not only from task checkboxes

## AI-Related Work Done So Far

### AI In The Product

The product-side AI work so far has focused on enabling safe future recitation analysis:

- analysis-service contract design
- comparison-result structure
- confidence-band modeling
- low-confidence safety rules
- fixture-based result simulation
- ASR feasibility research and benchmarking

### AI In The Delivery System

The project also uses AI as part of execution and project operations:

- Codex for planning, implementation, review, testing, and documentation
- Spec-Kit for structured feature definition
- `n8n` for orchestration and recurring workflows
- `Ollama` with `qwen3:8b` for low-risk local intelligence tasks
- CodeRabbit in the PR review loop

### Current AI Tools And Systems

Human-supervised or repo-integrated AI stack:

- Codex
- Spec-Kit
- CodeRabbit
- `n8n`
- `Ollama`
- local repo scripts
- Plane as the planning / execution system

### Current AI Safety Posture

The repo already encodes an important safety posture:

- do not overstate correctness
- do not treat low-confidence analysis as definitive
- keep ASR claims evidence-backed
- keep speech-recognition choice behind an abstraction boundary

This should remain a hard constraint in the refactor plan.

## Executors And Roles

## Human Role

### Founder / Product Owner

Current documented responsibilities:

- owns vision
- owns scope
- sets acceptance criteria
- defines the religious trust bar
- makes final product decisions

In practice, this human role is also the final authority on whether changed project targets should replace the original recitation-MVP assumptions.

## AI / Agent Roles

Current documented specialist roles:

- orchestrator
- product-discovery
- systems-architect
- interface-and-design
- mobile-engineering
- fullstack-engineering
- reviewer
- tester
- security
- docs
- speech-evaluation
- quran-domain-product

### Role Intent

- Orchestrator: turns ambiguity into execution-ready work
- Product Discovery: shapes user stories and priorities
- Systems Architect: owns contracts, boundaries, feasibility assumptions
- Mobile Engineering: owns Expo / React Native implementation quality
- Fullstack Engineering: owns APIs, persistence, and integration boundaries
- Interface And Design: owns clarity of flow and bilingual UX quality
- Speech Evaluation: owns ASR evidence and benchmarking
- Quran Domain Product: protects learner trust and religious correctness claims
- Reviewer / Tester / Security / Docs: permanent quality gates

## Control Plane / Executor Systems

### Codex + Skills

Owns:

- high-judgment engineering work
- planning
- implementation
- debugging
- review judgment
- documentation

### n8n

Owns:

- recurring workflows
- scheduling
- integration routing
- durable automation reporting

### Ollama Helpers

Owns:

- low-risk summaries
- categorization
- shallow task expansion drafts
- simple report-writing support

It is explicitly not the final authority for:

- code correctness
- merge approval
- learner-facing trust claims

### automation-runner

Owns:

- safe script execution on behalf of `n8n`
- controlled access to repo operations such as PR handling and backlog sync

## Current Technical Inventory

### App And Product Tech

- Expo-managed React Native mobile app
- TypeScript
- React Navigation
- Expo AV
- Zod
- Jest + React Native Testing Library
- ESLint

### Delivery And Automation Tech

- GitHub
- Plane
- `n8n`
- Docker Desktop
- `automation-runner`
- shell and Node.js repo scripts
- CodeRabbit
- Spec-Kit

### AI / ML / Speech Work

- `whisper.cpp`
- local ASR benchmark harness
- normalization rules for evaluation
- provider-shortlist analysis
- future comparator path that may include stronger hosted transcription models

## Known Constraints And Open Risks

### Product Risks

- original MVP scope may no longer match the newly changed targets
- recitation-first assumptions may need narrowing, expansion, or restructuring
- trust bar remains high because learner-facing religious feedback is sensitive

### Technical Risks

- current persistence approach is not yet mobile-native
- audio capture flow is not fully production-ready
- result rendering is not yet complete as a dedicated end-state experience
- some docs and task status markers lag behind implementation reality

### AI Risks

- local ASR baseline is not yet trustworthy for production correction claims
- confidence thresholds and mismatch classification are still research-heavy areas
- the real analysis backend/provider choice remains open

### Operational Risks

- the repo now contains both product code and an extensive automation platform, which increases planning complexity
- the next refactor should be careful not to break working automation while changing app-level architecture

## What Should Be Planned Next

The next refactor plan should start by re-answering the following questions in order:

1. What are the updated product targets now?
2. Which parts of the current recitation-MVP assumption still remain valid?
3. Which current foundations are strategic and should be preserved?
4. Which code paths are temporary shells that should be replaced rather than extended?
5. What is the desired near-term shape of the AI boundary: mock-only, hosted comparator, local-only experimentation, or staged provider abstraction?

## Recommended Next-Step Planning Areas

### 1. Re-baseline The Product

The planning agent should first restate:

- the new desired product target
- what remains in scope
- what is now deprecated from the original MVP direction

This is the most important step because many current docs still reflect the original constrained recitation-revision target.

### 2. Audit Current Code Against The New Target

The planning agent should classify each existing asset into:

- keep as-is
- keep but refactor
- replace
- deprecate

Priority candidates for that audit:

- `src/features/recitation/`
- `src/app/navigation/`
- `src/shared/i18n/`
- `src/shared/theme/`
- `docs/product/`
- `docs/architecture/`
- `specs/001-recitation-mvp-spec/`

### 3. Preserve The Valuable Stable Foundations

Unless the new targets strongly require otherwise, these are worth preserving:

- typed domain modeling with Zod
- clear service boundary around analysis
- bilingual copy foundation
- feature-first project structure
- guarded delivery system
- documented human/AI operating model

### 4. Re-decide The AI Strategy Explicitly

The planning agent should not assume the current AI path is already settled.

It should decide:

- whether the next phase is still mock-first
- whether the next ASR step is local benchmarking or hosted comparator testing
- whether the product should temporarily avoid hard AI-correction claims
- how confidence and uncertainty remain visible in the user experience

### 5. Refresh Planning Artifacts

After the new direction is confirmed, the planning agent should likely produce:

- an updated product brief
- an updated architecture brief
- a fresh refactor plan
- a keep / replace / retire inventory
- an updated execution backlog

## Suggested Instructions For The Next Refactor Agent

The next agent should use this repo with the following assumptions:

- The current repo is not greenfield.
- There is already a working mobile shell and a working delivery operating system.
- Existing docs represent the old target model and may need re-baselining.
- Existing tasks are useful context but are not an authoritative implementation-status ledger.
- The ASR path is still unresolved and should be treated as an explicit planning decision, not an implicit assumption.
- Learner trust and confidence-aware feedback remain non-negotiable constraints.

## Repo Pointers For Fast Onboarding

### Start Here

- `README.md`
- `docs/product/vision.md`
- `docs/product/mvp-scope.md`
- `docs/architecture/system-overview.md`
- `docs/agents/operating-model.md`
- `docs/agents/team-charter.md`
- `docs/setup/local-automation-stack.md`

### For Current Feature Implementation

- `src/app/`
- `src/features/recitation/`
- `src/shared/`
- `src/tests/`

### For Current Product Planning

- `specs/001-recitation-mvp-spec/`
- `docs/product/`
- `docs/architecture/`
- `docs/research/`

### For Automation And Execution Model

- `automation/n8n/`
- `scripts/`
- `docs/setup/guarded-delivery-pipeline.md`
- `docs/setup/tooling-blueprint.md`
- `docs/agents/agent-roster.md`

## Final Takeaway

What has been built so far is not only an app prototype. It is a combination of:

- a recitation-focused mobile foundation
- an AI-safe analysis boundary
- early ASR feasibility evidence
- a documented human-plus-agent operating model
- a local automation and guarded-delivery platform

The next refactor plan should therefore optimize for re-alignment, not restart. The key job now is to translate the changed targets into a refreshed architecture and execution plan while preserving the foundations that are already paying off.
