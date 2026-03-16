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

## MVP Success Criteria

- a learner can select a short passage and complete one full recitation check
- the system can classify basic mismatch types on a constrained target passage
- the result is understandable enough for a learner to retry without instruction
- the recognition pipeline is good enough on short passages to justify implementation

## Highest-Risk Assumption

An Arabic/Quran-aware recognition and alignment pipeline can be accurate enough on constrained passages to produce useful feedback.
