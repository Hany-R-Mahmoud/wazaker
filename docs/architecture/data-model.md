# Data Model

## Core Entities

### QuranPassage

- `id`
- `surahNumber`
- `ayahStart`
- `ayahEnd`
- `pageNumber`
- `textUthmani`
- `textNormalized`

### RecitationSession

- `id`
- `createdAt`
- `language`
- `targetPassageId`
- `status`
- `audioDurationMs`
- `analysisProvider`

### RecitationResult

- `sessionId`
- `overallScore`
- `confidence`
- `summary`
- `matchedSegments`
- `mismatchSegments`

### MismatchSegment

- `type`
- `expectedText`
- `recognizedText`
- `position`
- `confidence`

## Phase 1 Storage Guidance

- keep Quran passage content as static source data
- keep session history local on device first
- design backend contracts so cloud sync can be added later without breaking the client model
