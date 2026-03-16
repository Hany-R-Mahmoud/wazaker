# Audio Pipeline

## Objective

Determine whether a learner's recitation matches the selected Quran target closely enough to produce helpful feedback.

## Proposed Pipeline

1. Mobile client records audio.
2. Audio is normalized into the backend or analysis layer format.
3. The selected target passage metadata is attached to the request.
4. A speech recognition component produces recognized Arabic text and, if possible, token timing.
5. An alignment component compares recognized output to expected target text.
6. A comparison layer classifies mismatch types and confidence.
7. The result is returned as a learner-facing summary plus machine-usable detail.

## Required Output Shape

- target metadata
- transcript or token sequence
- alignment result
- mismatch classification
- confidence score
- learner-facing summary

## Known Risks

- reciter pauses and self-corrections can look like errors
- generic Arabic ASR may perform poorly on Quranic recitation
- diacritics and orthographic normalization need explicit rules
- confidence must be exposed honestly or trust will collapse

## Required Technical Spike

Before implementation, test short passages using multiple speakers and real phone recordings to answer:

- which recognition option performs best on constrained Quran recitation
- whether token-level alignment is reliable enough for feedback
- where confidence thresholds should block or soften correction
