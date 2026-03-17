# Implementation Plan: Recitation Revision MVP

**Branch**: `001-recitation-mvp-spec` | **Date**: 2026-03-17 | **Spec**: [/Users/hanyramadan/wazaker/specs/001-recitation-mvp-spec/spec.md](/Users/hanyramadan/wazaker/specs/001-recitation-mvp-spec/spec.md)
**Input**: Feature specification from `/specs/001-recitation-mvp-spec/spec.md`

## Summary

Build the first end-to-end recitation revision flow in Expo/React Native: the learner selects a constrained target passage, records an attempt, submits audio to a constrained comparison service contract, receives confidence-aware feedback, and can immediately retry while preserving prior attempts. The first implementation uses a local mobile shell plus a mocked analysis service contract so the UI, state model, and feedback trust rules can be validated before the ASR spike is wired in.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, React Native 0.83, Expo SDK 55  
**Primary Dependencies**: Expo, React Native, React Navigation, Expo AV or Expo Audio, Zod for response validation  
**Storage**: Local device persistence for session history in V1, remote analysis service outside the app process  
**Testing**: TypeScript type checks, Jest with React Native Testing Library, focused contract fixtures for analysis responses  
**Target Platform**: iOS and Android phones through Expo-managed workflow  
**Project Type**: Mobile app with a thin analysis-service integration boundary  
**Performance Goals**: First interaction under 2 minutes, screen transitions feel instant, result rendering under 200 ms after a response is received  
**Constraints**: Arabic-first UX, explicit low-confidence labeling, no tajweed grading in V1, no non-recitation modules, low-friction retry flow, intermittent network tolerance for analysis requests  
**Scale/Scope**: Single mobile app, one primary learner flow, short constrained passages in MVP, local history only, one analysis provider abstraction

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- `Trustworthy Recitation Feedback`: Pass. The plan keeps confidence and uncertainty first-class in the data contract and result UI.
- `Recitation First, Utility Creep Later`: Pass. The scope is limited to target selection, recording, analysis, feedback, and retry.
- `Arabic-First, Bilingual By Design`: Pass. UI copy and feedback model are designed Arabic-first with English support layered in.
- `Mobile-First Simplicity`: Pass. Expo-managed mobile architecture is preserved; no backend platform expansion is introduced inside this repo yet.
- `Evidence Before AI Claims`: Pass with follow-up. The implementation uses a mock analysis adapter first and keeps `SPIKE-001` as a required evidence gate before real ASR-based correctness claims.

## Project Structure

### Documentation (this feature)

```text
specs/001-recitation-mvp-spec/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── analysis-service.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
App.tsx
index.ts
src/
├── app/
│   ├── navigation/
│   └── providers/
├── features/
│   └── recitation/
│       ├── components/
│       ├── screens/
│       ├── hooks/
│       ├── services/
│       ├── storage/
│       └── types/
├── shared/
│   ├── i18n/
│   ├── theme/
│   └── ui/
└── test/
    ├── fixtures/
    └── helpers/
```

**Structure Decision**: Keep the Expo app in a single mobile project and introduce a feature-first `src/` layout. The first service boundary is an analysis adapter inside `src/features/recitation/services`, which lets us build the UI and state flow against a stable contract before choosing the real ASR path.

## Phase 0: Research Decisions

- Use an analysis adapter boundary instead of binding the mobile UI directly to a specific ASR provider.
- Start with local mocked analysis responses and contract fixtures to validate UX, state, and confidence handling before the real speech spike.
- Keep target selection constrained to short page/surah/ayah ranges so the comparison contract stays deterministic in V1.
- Store session history locally in the app during MVP to avoid premature account and backend requirements.

## Phase 1: Design Outputs

- `research.md`: captures provider strategy, mobile recording decisions, validation rules, and confidence policy.
- `data-model.md`: defines target passage, attempt, comparison result, and session record entities.
- `contracts/analysis-service.openapi.yaml`: documents the mobile-to-analysis request and response shape.
- `quickstart.md`: gives the implementation team a short path to bootstrap UI work, mocked analysis integration, and verification.

## Phase 2: Implementation Preview

1. Create the feature-first Expo structure under `src/`.
2. Implement target selection and local session state.
3. Implement recording shell with permission and cancellation handling.
4. Implement analysis adapter with mock fixtures that conform to the contract.
5. Implement result screen with confidence-aware feedback and retry flow.
6. Add local session history and basic tests around contract parsing and flow state.
7. Use the resulting contract and fixtures as the baseline for `SPIKE-001`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Separate analysis-service contract before real backend exists | We need a stable interface for mobile delivery and the ASR spike to work in parallel | Directly wiring UI to a provider would couple early UX work to an unvalidated AI choice |
