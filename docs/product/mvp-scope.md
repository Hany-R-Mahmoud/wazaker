# MVP Scope

## In Scope

- bilingual mobile app shell for Arabic and English
- Quran passage or page selection
- recording flow for personal recitation
- recitation upload or processing flow
- expected-text comparison against selected target
- result screen with basic error feedback
- retry flow
- session history stored locally

## Explicitly Out Of Scope

- prayer times
- qibla
- azkar
- social/community features
- competitions
- commerce or store
- generalized Islamic super-app behavior
- advanced tajweed scoring
- teacher marketplace
- account system unless required by the chosen backend

These modules are deferred to Phase 2 after the recitation revision Phase 1 MVP is complete.

## MVP Success Criteria

- a learner can select a short passage and complete one full recitation check
- the system can classify basic mismatch types on a constrained target passage
- the result is understandable enough for a learner to retry without instruction
- the recognition pipeline is good enough on short passages to justify implementation

## Highest-Risk Assumption

An Arabic/Quran-aware recognition and alignment pipeline can be accurate enough on constrained passages to produce useful feedback.

## Approved Delivery Rules

- The canonical Phase 1 learner flow is: select target, record recitation, analyze, show feedback, retry the same target.
- MVP target selection starts with surah plus ayah range. Page-level selection remains optional for a later slice if validation stays simple.
- Low-confidence analysis must never be presented as definite correction; the app should guide the learner to retry or verify manually.
- The first runnable MVP shell may ship with a mock analysis service while real ASR remains gated behind the feasibility spike.
