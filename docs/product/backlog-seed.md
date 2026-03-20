# Backlog Seed

## Epic 1: Project Foundation

- create GitHub repository and connect local remote
- create Plane workspace and project
- create Penpot workspace and project
- register design and PM links in repo docs

## Epic 2: Product Definition

- finalize MVP promise and explicit non-goals
- define the first approved user flow
- define bilingual content rules for Arabic and English UI
- create acceptance criteria for recitation result quality
- record that Phase 1 is recitation-only and Phase 2 begins after Phase 1 is complete
- lock the canonical MVP flow as target selection, recording, analysis, feedback, and retry
- lock the trust rule that low-confidence feedback must never sound definitive

## Epic 3: Recitation Feasibility Spike

- choose candidate ASR approaches
- define sample set for short passages
- run recordings across multiple speakers
- compare recognition and alignment quality
- document proceed or stop recommendation

## Epic 4: Mobile App Foundation

- scaffold Expo app
- define navigation and state approach
- implement passage selection flow
- implement record flow
- implement result shell with mock data

## Epic 5: Analysis Service Foundation

- define request and response contracts
- build session analysis endpoint
- normalize audio inputs
- return structured mismatch output

## Epic 6: User Feedback And Trust

- define low-confidence messaging rules
- define mismatch taxonomy for user-facing output
- design retry and session review flow
- validate comprehension with sample users

## Approved Product Decisions

- Phase 1 is limited to the recitation revision flow; prayer times, qibla, azkar, social, commerce, and account work move to Phase 2 unless technically required
- The canonical MVP flow is: select target, record recitation, analyze, show feedback, retry the same target
- MVP target selection should start with surah plus ayah range; page-level selection can follow in a later slice if validation stays simple
- Low-confidence results must be labeled as uncertain and must direct the learner to retry or verify manually
- The product is Arabic-first with English support
- The first runnable MVP shell may use a mock analysis service; real ASR remains gated behind the feasibility spike
- Real ASR should only move forward after a short-passage benchmark and a written proceed-or-stop recommendation
