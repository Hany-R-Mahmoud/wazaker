# System Overview

## Goal

Deliver a mobile-first recitation revision system that lets a learner select a passage, recite it, receive feedback, and retry.

## Primary Components

### Mobile Client

- Expo / React Native app
- target passage selection
- audio recording
- local session state
- result rendering
- local history

### Quran Content Layer

- canonical Quran text
- surah, ayah, juz, and page mapping
- optional mushaf page assets

### Recitation Analysis Layer

- audio normalization
- Arabic/Quran-aware speech recognition
- alignment between recognized output and expected target text
- mismatch classification and confidence scoring

### Session Backend

- session creation and analysis request handling
- result storage if cloud-backed history is later required
- observability for analysis outcomes

## Recommended Boundary For Phase 1

Keep the mobile app and analysis service separate. The recognition and alignment logic will change faster than the mobile UI and should be isolated behind a narrow contract.

## Phase 1 Architectural Bias

- mobile-first, not web-first
- constrained target passage selection
- explicit confidence handling
- simple API contracts
- local-first history unless cloud need becomes concrete
