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

## Phase 2 Spike Shape

The first spike should not start by wiring the Expo app directly to a production provider. It should start as an evaluation harness with:

1. canonical target passages from Quran.com
2. real phone recordings from a constrained sample set
3. one baseline transcription path
4. one quality-comparator transcription path
5. normalization rules applied before scoring
6. a structured results template for go/no-go decisions

## Current Provider Bias

At this stage, the most practical path is:

- baseline: OpenAI `whisper-1`
- comparator: OpenAI `gpt-4o-transcribe`

This is a speed and evidence decision, not a final architectural commitment. If these paths fail the spike, the next step is to evaluate Quran-specific model routes or partner APIs before exposing learner-facing correction.
