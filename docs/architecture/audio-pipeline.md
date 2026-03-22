# Audio Pipeline

## Objective

Score an ayah-level user recitation against Quran reference text and Al-Husary timing data without overstating certainty.

## Target Production Pipeline

1. Mobile client records one ayah.
2. Mobile client uploads audio to Supabase Storage.
3. Mobile client creates a `recitation_sessions` row with `status = pending`.
4. `n8n` detects the pending session.
5. `n8n` fetches the audio file from Supabase Storage.
6. `n8n` sends the file to the VPS transcription service backed by Whisper.cpp.
7. The transcription service returns Arabic text, word timings, and confidence values.
8. `n8n` loads reference words and Al-Husary timestamps for the same Surah and ayah.
9. A scoring step compares user output to the reference with normalization and timing tolerance.
10. `n8n` writes `overall_score`, `word_results`, and final status back to Supabase.
11. The mobile app polls through the existing analysis-service boundary and renders the result.

## Required Output Shape

- Surah and ayah identity
- transcription text
- per-word timing
- per-word confidence
- per-word status: `correct` | `incorrect` | `uncertain`
- overall score
- learner-facing summary

## Confidence Gate

This is the most important rule in the pipeline.

- if confidence is below the threshold, the word status must be `uncertain`
- uncertain words must not be counted as incorrect
- the UI must render uncertain words distinctly from incorrect words

Current target threshold from the refactor plan:

- `< 0.75` confidence becomes `uncertain`

This threshold remains adjustable based on validation findings.

## Current Interface Rule

The mobile app must continue to depend on the `analysis-service` contract, not on direct workflow details.

That means:

- the current interface is preserved
- the implementation behind it can move from fixtures to Supabase polling
- tests can keep using fixture-backed responses

## Known Risks

- Arabic transcription quality may vary across ayahs and recitation speed
- pauses and self-corrections can distort naive word matching
- word timestamps may require fallback logic if Whisper output is incomplete
- VPS CPU performance may become a bottleneck if the cohort grows

## Validation Gate

Real scoring is not considered ship-ready until Surah Al-Fatiha validation shows that:

- correct recitation scores remain directionally strong
- clearly wrong words can be surfaced without inflating false negatives
- silent or weak audio stays uncertain rather than producing misleading red words
