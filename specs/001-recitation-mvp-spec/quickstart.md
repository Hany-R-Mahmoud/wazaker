# Quickstart: Recitation Revision MVP

## Goal

Get the first implementation slice ready for development without binding the app to a real ASR provider yet.

## 1. Prepare the app structure

- Create `src/` with `app`, `features`, and `shared` directories as defined in the plan.
- Move the current landing shell in `App.tsx` into a feature-aware app container.
- Add navigation scaffolding for:
  - Home
  - Target selection
  - Recording
  - Result
  - Session history

## 2. Add the recitation feature types first

- Implement `TargetPassage`, `RecitationAttempt`, `ComparisonSegment`, `ComparisonResult`, and `SessionRecord` in `src/features/recitation/types`.
- Add runtime validation for analysis responses so low-confidence and uncertain states cannot be silently ignored.

## 3. Build against a mock analysis adapter

- Create a service interface in `src/features/recitation/services/analysis-service.ts`.
- Create fixture-backed mock responses in `src/test/fixtures`.
- Keep a single swap point so the future ASR spike can replace the mock implementation without screen rewrites.

## 4. Implement the user flow in this order

1. Target selection
2. Recording shell and permissions
3. Submit/analyzing state
4. Result screen with confidence-aware feedback
5. Retry from result
6. Local session history

## 5. Verify before moving to tasks

- `npx tsc --noEmit`
- Add focused tests for:
  - contract parsing
  - attempt state transitions
  - result rendering rules around low confidence

## 6. Use this plan to start the spike

After the mobile flow is wired to the mock adapter, use the same contract and sample targets to execute `SPIKE-001` against a real ASR candidate.
