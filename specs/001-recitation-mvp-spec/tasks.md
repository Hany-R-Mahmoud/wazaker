# Tasks: Recitation Revision MVP

**Input**: Design documents from `/specs/001-recitation-mvp-spec/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Include focused behavior and contract tests where they protect confidence handling, state transitions, and learner-facing feedback.

**Organization**: Tasks are grouped by user story to keep delivery independently testable and easy to mirror in Plane.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Introduce the project structure and dependencies required for the recitation feature work.

- [ ] T001 Create the feature-first mobile structure in `src/app/`, `src/features/recitation/`, `src/shared/`, and `src/test/`
- [X] T002 Update dependencies and scripts for navigation, recording, validation, and tests in `/Users/hanyramadan/wazaker/package.json`
- [X] T003 [P] Add shared recitation theme and bilingual copy foundations in `src/shared/theme/` and `src/shared/i18n/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define shared types, adapters, storage, and navigation contracts that every user story depends on.

- [X] T004 Create recitation domain types from the data model in `src/features/recitation/types/`
- [X] T005 [P] Implement runtime schemas for target selection and comparison results in `src/features/recitation/types/schemas.ts`
- [X] T006 [P] Create a mockable analysis service interface aligned with `specs/001-recitation-mvp-spec/contracts/analysis-service.openapi.yaml` in `src/features/recitation/services/analysis-service.ts`
- [ ] T007 [P] Add fixture-backed mock analysis responses in `src/test/fixtures/recitation-analysis.ts`
- [ ] T008 Implement local session persistence and history repository in `src/features/recitation/storage/session-history.ts`
- [ ] T009 Create app navigation and shared recitation flow state in `src/app/navigation/` and `src/features/recitation/hooks/`
- [ ] T010 Add user-safe async error and loading state helpers in `src/shared/ui/` and `src/features/recitation/hooks/`

**Checkpoint**: The mobile app has a stable feature shell, typed contracts, local storage, and a mock analysis boundary.

---

## Phase 3: User Story 1 - Revise a Selected Passage (Priority: P1) 🎯 MVP

**Goal**: Let a learner choose a target passage, record a recitation attempt, and receive structured comparison feedback tied to that exact target.

**Independent Test**: Select a short passage, record a mock attempt, submit it through the mock analysis adapter, and confirm that the result is tied to the target and shows mismatch details.

### Tests for User Story 1

- [ ] T011 [P] [US1] Add analysis contract fixture tests in `src/test/analysis-service.contract.test.ts`
- [ ] T012 [P] [US1] Add flow-state tests for attempt lifecycle transitions in `src/test/recitation-flow-state.test.ts`

### Implementation for User Story 1

- [ ] T013 [P] [US1] Build the target selection screen for page, surah, and ayah-range choices in `src/features/recitation/screens/TargetSelectionScreen.tsx`
- [ ] T014 [US1] Implement target selection state and validation in `src/features/recitation/hooks/useTargetSelection.ts`
- [ ] T015 [P] [US1] Build the recording screen shell with permission prompts and recording controls in `src/features/recitation/screens/RecordingScreen.tsx`
- [ ] T016 [US1] Implement recording orchestration and attempt creation in `src/features/recitation/hooks/useRecitationRecorder.ts`
- [ ] T017 [US1] Implement analysis submission and result mapping in `src/features/recitation/services/submitRecitationAttempt.ts`
- [ ] T018 [US1] Build the result screen with omission, insertion, substitution, and uncertainty states in `src/features/recitation/screens/ResultScreen.tsx`

**Checkpoint**: User Story 1 works end to end using the mock analysis service and is suitable for MVP walkthroughs.

---

## Phase 4: User Story 2 - Retry Within the Same Revision Session (Priority: P2)

**Goal**: Let the learner retry the same target directly from the result view while preserving prior attempts.

**Independent Test**: Complete one attempt, start a retry from the result screen, and confirm the new attempt keeps the same target while preserving the earlier record.

### Tests for User Story 2

- [ ] T019 [P] [US2] Add retry-flow tests covering preserved session history in `src/test/retry-session-history.test.ts`

### Implementation for User Story 2

- [ ] T020 [US2] Add retry action handling from the result screen in `src/features/recitation/screens/ResultScreen.tsx`
- [ ] T021 [US2] Implement attempt reset logic that preserves target selection in `src/features/recitation/hooks/useRecitationSession.ts`
- [ ] T022 [US2] Render saved attempts and statuses in `src/features/recitation/screens/SessionHistoryScreen.tsx`

**Checkpoint**: The learner can retry rapidly without losing the previous attempt record.

---

## Phase 5: User Story 3 - Understand Uncertain Results Safely (Priority: P3)

**Goal**: Make uncertainty visible and learner-safe so the app never overstates correctness.

**Independent Test**: Submit a low-confidence fixture response and verify that the UI labels it as uncertain and recommends retry or manual verification.

### Tests for User Story 3

- [ ] T023 [P] [US3] Add low-confidence rendering tests in `src/test/low-confidence-feedback.test.tsx`

### Implementation for User Story 3

- [ ] T024 [US3] Add confidence band presentation and copy rules in `src/features/recitation/components/ConfidenceBanner.tsx`
- [ ] T025 [US3] Implement low-confidence guidance and manual verification prompts in `src/features/recitation/screens/ResultScreen.tsx`
- [ ] T026 [US3] Ensure comparison summaries never render definitive language for uncertain segments in `src/features/recitation/components/FeedbackSegmentList.tsx`

**Checkpoint**: Low-confidence results are clearly labeled and user-safe.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Tighten documentation, validation, and release-readiness for the MVP slice.

- [ ] T027 [P] Document the mock analysis integration and swap-point for the future ASR spike in `docs/architecture/` and `README.md`
- [ ] T028 Run `npx tsc --noEmit` and the new focused test suite, then capture any follow-up fixes in the active branch
- [ ] T029 [P] Re-sync Plane backlog statuses and dependency notes after implementation tasks are accepted in `docs/product/plane-backlog.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 must complete first.
- Phase 2 blocks all user story implementation.
- Phase 3 delivers the MVP slice.
- Phase 4 depends on User Story 1 flow state and result screen.
- Phase 5 depends on User Story 1 result rendering and response parsing.
- Phase 6 happens after the desired user stories are complete.

### User Story Dependencies

- **US1**: Starts immediately after foundational work and defines the MVP.
- **US2**: Depends on US1 attempt/result flow but remains independently testable.
- **US3**: Depends on US1 result rendering but remains independently testable with low-confidence fixtures.

### Parallel Opportunities

- T003, T005, T006, and T007 can proceed in parallel once the directory structure exists.
- In US1, T013 and T015 can proceed in parallel after foundational hooks and types are ready.
- US2 and US3 can be split across collaborators once US1 is stable.

## Implementation Strategy

### MVP First

1. Finish Setup and Foundational phases.
2. Deliver User Story 1 with the mock analysis adapter.
3. Validate the core flow with Arabic-first copy and confidence-aware feedback before moving on.

### Incremental Delivery

1. Add retry and local session history.
2. Tighten low-confidence behavior.
3. Use the resulting fixtures and contract to drive `SPIKE-001`.
