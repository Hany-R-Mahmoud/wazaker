# User Stories

## Epic: Recitation Revision

### Story 1

As a Quran learner, I want to choose a constrained target passage before reciting so that the app knows what text to compare against.

Acceptance criteria:

- the user can choose a constrained target passage
- MVP starts with surah plus ayah-range selection
- the selected target is visible before recording starts
- the app stores the target metadata with the session

### Story 2

As a Quran learner, I want to record my recitation from the phone so that I can test my memorization without another person present.

Acceptance criteria:

- the app requests microphone permission clearly
- the user can start, stop, and retry recording
- the app handles cancellation and permission denial gracefully

### Story 3

As a Quran learner, I want the app to compare my recitation to the expected text so that I can find mistakes in revision.

Acceptance criteria:

- the app sends or processes the selected recording for analysis
- the analysis is tied to the selected target passage
- the system returns a structured comparison result
- low-confidence outcomes never sound definitive and instead recommend retry or manual verification

### Story 4

As a Quran learner, I want to see what I missed or changed so that I know what to revise.

Acceptance criteria:

- the result distinguishes likely omission, insertion, and substitution
- low-confidence results are labeled clearly
- the feedback is readable in Arabic and understandable without technical terms
- Arabic learner-facing copy is primary and English support mirrors the same trust rules

### Story 5

As a Quran learner, I want to retry immediately after feedback so that I can improve within the same study session.

Acceptance criteria:

- the user can start a new attempt from the result view
- previous session data is preserved
- the flow is fast enough for repeat use

## Epic: Session History

### Story 6

As a Quran learner, I want recent recitation sessions saved on-device so that I can review my progress.

Acceptance criteria:

- sessions can be listed in reverse chronological order
- each session shows target, timestamp, and summary result
- failed or incomplete sessions are labeled clearly
