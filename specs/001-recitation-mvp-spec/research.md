# Research: Recitation Revision MVP

## Decision 1: Use a mocked analysis adapter before integrating a real ASR path

**Decision**: Build the mobile flow against an internal analysis adapter that can return fixture-based comparison results matching the planned service contract.

**Rationale**:
- The constitution requires evidence before AI claims.
- The highest-risk unknown is analysis quality, not screen rendering.
- Mocked responses let us validate target selection, session state, low-confidence messaging, and retry flow immediately.

**Alternatives considered**:
- Integrate Whisper or another Arabic ASR immediately: rejected for now because it couples app architecture to an unvalidated recognition path.
- Block all UI work until the ASR spike completes: rejected because it slows product learning unnecessarily.

## Decision 2: Keep the first result model constrained and confidence-aware

**Decision**: The first result payload will support `match`, `omission`, `insertion`, `substitution`, and `uncertain` segment outcomes plus an overall confidence band.

**Rationale**:
- These categories directly match the current user stories and acceptance criteria.
- This is enough to support learner-facing revision feedback without overreaching into tajweed grading.
- Confidence needs to exist at both the overall attempt level and the segment level.

**Alternatives considered**:
- A simple pass/fail score only: rejected because it would not tell learners what to revise.
- Tajweed-specific phonetic detail in V1: rejected because it expands scope beyond memorization revision.

## Decision 3: Use local persistence for session history in MVP

**Decision**: Persist completed and incomplete session records on-device only during Phase 1.

**Rationale**:
- The learner value does not require accounts yet.
- Local storage keeps the app usable before backend identity, sync, or moderation concerns are introduced.
- It supports the retry and history stories with minimal operational load.

**Alternatives considered**:
- Remote account-backed history: rejected because it adds auth and backend scope before core usefulness is proven.
- No saved history at all: rejected because the spec requires preserving prior attempts.

## Decision 4: Constrain passage selection to short revision targets

**Decision**: The initial UI should steer users toward page, surah, or short ayah ranges that are realistic for one recording attempt.

**Rationale**:
- Shorter targets improve evaluation quality and reduce learner confusion.
- They also keep result rendering tractable for the first UI.
- This aligns with the spike goal of benchmarking on short passages first.

**Alternatives considered**:
- Allow arbitrary long multi-page selections from day one: rejected because it increases recognition ambiguity and weakens trust.

## Decision 5: Prepare for intermittent connectivity instead of assuming offline analysis

**Decision**: The mobile app should treat analysis as network-backed, but design the flow to handle delay, retry, and failure gracefully.

**Rationale**:
- A reliable on-device Quran-aware ASR path is not yet selected.
- Network-backed analysis is the more realistic first integration shape.
- The UI can still feel trustworthy if it explains pending analysis and failures clearly.

**Alternatives considered**:
- Offline-only analysis in V1: rejected because there is no validated offline path yet.
- Always-online optimistic flow with no error model: rejected because it would produce a brittle learner experience.
