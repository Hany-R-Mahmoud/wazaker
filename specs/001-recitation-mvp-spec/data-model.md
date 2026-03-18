# Data Model: Recitation Revision MVP

## TargetPassage

Represents the Quran scope the learner intends to revise.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Stable local identifier for the selected target |
| `selectionType` | `"page" \| "surah" \| "ayahRange"` | Drives UI and contract validation |
| `pageNumber` | number \| null | Required when `selectionType = "page"` |
| `surahNumber` | number \| null | Required for `surah` and `ayahRange` |
| `ayahStart` | number \| null | Required for `ayahRange` |
| `ayahEnd` | number \| null | Required for `ayahRange` |
| `displayNameAr` | string | Arabic learner-facing title |
| `displayNameEn` | string | English learner-facing title |
| `canonicalText` | string | Expected Quran text for this target |
| `canonicalReference` | string | Normalized reference used by the analysis service |

**Validation rules**
- Exactly one target mode is valid at a time.
- `ayahStart <= ayahEnd`.
- `canonicalText` must be non-empty before recording starts.

## RecitationAttempt

One learner recording submission tied to a target passage.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Local attempt identifier |
| `targetPassageId` | string | Foreign key to `TargetPassage.id` |
| `status` | `"draft" \| "recording" \| "uploading" \| "analyzing" \| "completed" \| "cancelled" \| "failed"` | Drives UI state |
| `audioUri` | string \| null | Local recording location |
| `durationMs` | number | Captured recording length |
| `startedAt` | string | ISO timestamp |
| `completedAt` | string \| null | ISO timestamp |
| `failureReason` | string \| null | User-safe failure reason |

**State transitions**
- `draft -> recording -> uploading -> analyzing -> completed`
- `recording -> cancelled`
- `uploading|analyzing -> failed`
- Retrying creates a new attempt rather than mutating a completed one.

## ComparisonSegment

One learner-visible piece of structured feedback.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Stable segment identifier |
| `kind` | `"match" \| "omission" \| "insertion" \| "substitution" \| "uncertain"` | Segment classification |
| `expectedText` | string | Canonical text slice |
| `observedText` | string \| null | Recognized text slice if available |
| `confidence` | number | `0..1` |
| `startTokenIndex` | number | Position in normalized target tokens |
| `endTokenIndex` | number | Inclusive position end |
| `messageAr` | string | Arabic learner-facing explanation |
| `messageEn` | string | English learner-facing explanation |

**Validation rules**
- `confidence` must be normalized between `0` and `1`.
- `uncertain` segments must not use definitive learner-facing wording.

## ComparisonResult

Structured analysis returned for an attempt.

| Field | Type | Notes |
|---|---|---|
| `attemptId` | string | Foreign key to `RecitationAttempt.id` |
| `targetPassageId` | string | Foreign key to `TargetPassage.id` |
| `overallConfidence` | number | `0..1` aggregate confidence |
| `confidenceBand` | `"high" \| "medium" \| "low"` | Simplified learner-facing confidence |
| `summaryAr` | string | Arabic summary |
| `summaryEn` | string | English summary |
| `segments` | `ComparisonSegment[]` | Ordered comparison segments |
| `retryRecommended` | boolean | Supports result CTA |
| `manualVerificationRecommended` | boolean | Required when confidence is low |

## SessionRecord

Historical record stored locally for learner review.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Local session identifier |
| `targetPassage` | `TargetPassage` | Snapshot of the target at attempt time |
| `attempt` | `RecitationAttempt` | Attempt metadata |
| `result` | `ComparisonResult \| null` | Null for cancelled or failed attempts |
| `createdAt` | string | ISO timestamp |

**Retention rule**
- Completed, failed, and cancelled attempts should remain visible in history with clear status labels.
