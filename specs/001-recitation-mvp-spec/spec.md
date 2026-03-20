# Feature Specification: Recitation Revision MVP

**Feature Branch**: `001-recitation-mvp-spec`  
**Created**: 2026-03-17  
**Status**: Approved  
**Input**: User description: "Create the Phase 1 recitation revision feature for wazaker. The user selects a Quran passage or page, records recitation from memory, the app compares the recitation against expected Quran text, returns clear trustworthy feedback with confidence awareness, and allows immediate retry. V1 is mobile-first, Arabic-first with English support, and excludes prayer times, qibla, azkar, commerce, and social features."

## Approval Notes

- Phase 1 is limited to recitation revision. Non-recitation modules move to Phase 2 after Phase 1 is complete.
- The canonical MVP learner flow is: select target, record recitation, analyze, show feedback, retry the same target.
- MVP target selection starts with surah plus ayah range. Page-level selection is deferred unless it remains validation-safe in the same slice.
- Low-confidence results must never sound definitive and must direct the learner to retry or verify manually.
- The product is Arabic-first with English support.
- The first runnable MVP shell may use a mock analysis service; real ASR remains gated behind `SPIKE-001`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Revise a Selected Passage (Priority: P1)

A Quran learner selects a constrained target passage, starting with surah and ayah range in MVP, recites from memory, and receives a structured result showing whether the recitation matches the selected target and where likely mistakes occurred.

**Why this priority**: This is the core value of the product. Without selected-target revision and comparison, the MVP does not solve the main problem.

**Independent Test**: Can be fully tested by selecting a short target passage, recording one attempt, and verifying that the returned result is tied to the selected passage and contains readable feedback.

**Acceptance Scenarios**:

1. **Given** the learner has selected a target passage, **When** the learner records and submits a recitation attempt, **Then** the system returns a result linked to that target passage.
2. **Given** the recitation differs from the expected text, **When** the result is shown, **Then** the learner can see the likely mismatch type and where it occurred.

---

### User Story 2 - Retry Within the Same Revision Session (Priority: P2)

A Quran learner reviews the feedback from one attempt and immediately retries the same target passage without repeating the entire setup flow.

**Why this priority**: The product is meant for revision, not one-off checking. Fast retry is essential for practical memorization use.

**Independent Test**: Can be fully tested by completing one attempt, viewing the result, starting another attempt from the same result flow, and confirming that the target passage remains unchanged.

**Acceptance Scenarios**:

1. **Given** the learner is viewing the result of a completed attempt, **When** the learner chooses to retry, **Then** a new attempt starts for the same target passage.
2. **Given** the learner retries the same target, **When** the second result is shown, **Then** the earlier attempt remains preserved as a separate session record.

---

### User Story 3 - Understand Uncertain Results Safely (Priority: P3)

A Quran learner receives feedback that clearly distinguishes high-confidence results from uncertain results so the app does not overstate correctness.

**Why this priority**: Trust is critical for Quran revision. The MVP must avoid presenting uncertain analysis as authoritative.

**Independent Test**: Can be fully tested by submitting a low-quality or incomplete recording and verifying that the result is labeled as uncertain rather than definitive.

**Acceptance Scenarios**:

1. **Given** the recording quality or comparison confidence is low, **When** the result is displayed, **Then** the app labels the result as low-confidence and avoids strong claims.
2. **Given** the learner views uncertain feedback, **When** the learner reads the result, **Then** the app encourages retry or manual verification rather than treating the result as final.

### Edge Cases

- What happens when the learner denies microphone permission?
- What happens when the learner stops mid-recitation or submits a very short attempt?
- What happens when the learner chooses a target that is too long for a single effective attempt?
- How does the system behave when the recording quality is too noisy for trustworthy comparison?
- How does the system respond when the learner repeats verses, hesitates, or restarts within the same attempt?
- When page-level selection is introduced later, how will the UI keep the effective recording scope constrained?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow the learner to choose a constrained Quran target before recording, with MVP support starting at surah and ayah-range selection.
- **FR-002**: The system MUST show the selected target clearly before the learner starts recording.
- **FR-003**: The system MUST allow the learner to start, stop, cancel, and retry a recitation attempt from the mobile device.
- **FR-004**: The system MUST request microphone access with clear learner-facing messaging before recording.
- **FR-005**: The system MUST associate every recitation attempt with the exact selected target passage.
- **FR-006**: The system MUST compare the learner’s recitation attempt against the expected Quran text for the selected target.
- **FR-007**: The system MUST return a structured result that can represent likely omission, insertion, substitution, and uncertain segments.
- **FR-008**: The system MUST label low-confidence analysis clearly and MUST avoid presenting uncertain output as definite correction.
- **FR-009**: The system MUST present learner-facing feedback in Arabic and MUST support English user interface content where applicable.
- **FR-010**: The system MUST allow the learner to retry the same target directly from the result view.
- **FR-011**: The system MUST preserve prior completed attempts as separate session records for the learner.
- **FR-012**: The system MUST handle incomplete, canceled, and failed attempts without corrupting session history.
- **FR-013**: The system MUST exclude non-MVP modules from this feature scope, including prayer times, qibla, azkar, commerce, and social features.
- **FR-014**: The system MUST keep the first version focused on memorization revision feedback rather than advanced tajweed grading.
- **FR-015**: The first runnable MVP shell MUST be valid with a mock analysis service while `SPIKE-001` determines whether a real ASR path is good enough to trust.

### Key Entities *(include if feature involves data)*

- **Target Passage**: The selected Quran scope for a revision attempt, including target type, boundaries, and canonical text reference.
- **Recitation Attempt**: One learner recording submission tied to a target passage, including timing, status, and recording metadata.
- **Comparison Result**: Structured output describing likely matches, mismatches, low-confidence areas, and retry guidance.
- **Revision Session Record**: Saved summary of a completed or incomplete attempt, including target, timestamp, and result status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A learner can complete the end-to-end revision flow for a short target passage in under 2 minutes on first use.
- **SC-002**: In moderated MVP testing, at least 90% of learners can identify what to retry or revise after seeing one result.
- **SC-003**: 100% of low-confidence analyses shown in testing are explicitly labeled as uncertain in the result view.
- **SC-004**: At least 80% of repeat attempts in testing begin from the result screen rather than restarting the flow from target selection.
- **SC-005**: The MVP backlog and implementation plan remain scoped to recitation revision only, with zero non-core modules added to the Phase 1 release candidate.
- **SC-006**: A written proceed-or-stop recommendation from `SPIKE-001` exists before the product makes real ASR-backed correctness claims.
