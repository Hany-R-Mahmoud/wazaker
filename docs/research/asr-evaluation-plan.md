# ASR Evaluation Plan

## Purpose

Evaluate whether the recitation analysis problem is feasible enough to support the Wazaker MVP without overstating AI correctness. This spike is specifically about constrained Quran revision on short passages, not general Arabic dictation and not tajweed grading.

## Scope for Phase 2

Test short, constrained passages that match the MVP target model:

- Al-Fatiha
- short surahs from Juz Amma
- small ayah ranges from memorized passages
- one or two Madani page selections that are still realistic for a single attempt

This spike should answer:

1. Can the recognizer stay aligned to the expected target passage?
2. Can we classify omission, insertion, substitution, and uncertain segments without misleading the learner?
3. What confidence threshold should prevent definitive feedback?
4. Is the first provider fast and affordable enough for mobile revision?

## Candidate Paths

### Candidate A: `whisper.cpp` local baseline

Use a local Whisper-family runner as the first benchmark path so the team can produce real transcription output without API spend. The purpose here is not production quality. It is to establish whether constrained Quran recitation can be aligned and scored usefully enough to justify deeper investment.

### Candidate B: OpenAI `whisper-1` hosted baseline

Use `whisper-1` as the first baseline because OpenAI documents it as generally available for transcription and supports richer transcription response formats than the newer 4o transcription models, including `verbose_json`. That makes it the easiest first candidate when alignment detail matters.

### Candidate C: OpenAI `gpt-4o-transcribe`

Use `gpt-4o-transcribe` as the higher-quality transcription comparator. OpenAI documents it as an improved speech-to-text model relative to Whisper, but its output options are more limited. This makes it a strong quality comparison candidate even if `whisper-1` remains the easier first integration for alignment-heavy experiments.

### Candidate D: Tarteel-inspired benchmark, not a dependency

Tarteel’s official help content clearly shows production features for Quran voice search and memorization mistake detection, and TarteelAI maintains public ML repositories for Quran speech data and training workflows. However, I did not find clear public developer API documentation for a hosted recitation-analysis API during this planning pass. Because of that, we should treat Tarteel as a benchmark and product reference, not as the initial integration dependency.

This last point is an inference from official sources, not a confirmed statement by Tarteel.

## Canonical Text Source

Use Quran.com’s official content API as the canonical text source for the spike. Its documentation supports filtering verses by surah, juz, and Madani page number, which maps directly to our target-selection model.

## Sample Set Design

Build the first sample set around 24 to 30 recordings:

- 3 passages
  - Al-Fatiha
  - one short surah
  - one ayah range from a longer surah
- 4 to 5 speakers
  - mixed fluency levels
  - at least one strong memorizer
  - at least one learner with pauses and restarts
- 2 attempt styles per speaker
  - correct recitation
  - intentionally imperfect recitation

Each recording should include metadata:

- speaker id
- passage id
- expected text reference
- device type
- environment noise level
- attempt style
- notes about pauses, repeats, or restarts

## Normalization Rules

Before scoring, normalize both expected and recognized text consistently:

- remove non-essential punctuation differences
- define a clear rule for hamza and alif variants
- define whether tashkeel is ignored, partially normalized, or preserved
- define how basmala is handled when present or omitted
- define how repeated self-correction tokens are counted

If normalization rules are fuzzy, the spike result will be noisy and misleading.

## Evaluation Metrics

Track both product-facing and model-facing metrics.

### Product-facing metrics

- `target_hit_rate`: did the recognizer stay inside the selected passage
- `actionability_rate`: could a learner reasonably act on the returned result
- `uncertainty_honesty`: were weak results correctly labeled low-confidence
- `retry_suitability`: did the output support immediate retry without confusion

### Model-facing metrics

- `normalized_wer`: word error rate against normalized expected text
- `passage_alignment_success`: percentage of attempts aligned to the right passage
- `mismatch_detection_precision`: precision for omission, insertion, substitution
- `mismatch_detection_recall`: recall for omission, insertion, substitution
- `segment_confidence_calibration`: do low-confidence segments actually correspond to ambiguity
- `latency_ms`: time from upload to usable structured result
- `estimated_cost_per_minute`

## Go / No-Go Thresholds

Proceed to MVP integration only if the first provider can meet these minimum conditions on the short-passage sample set:

- at least 85% passage alignment success
- low-confidence labeling on every materially ambiguous result
- omission and substitution feedback that is directionally helpful on most learner-visible errors
- latency acceptable for revision sessions, ideally under 8 seconds for short passages

Stop or narrow scope if:

- the recognizer frequently lands on the wrong passage
- pauses and restarts are repeatedly misreported as real mistakes
- confidence cannot separate reliable from unreliable outputs
- the cost/latency tradeoff is poor for repeated daily use

## Recommended Execution Order

1. Prepare canonical text fixtures from Quran.com for the selected passages.
2. Record the sample set on real phones.
3. Run Candidate A on the full set.
4. Score Candidate A against the normalization rules.
5. If the signal is promising, run Candidate B or C as quality comparators later.
6. Fill the results template and write the recommendation.

## Current Recommendation

Start with:

1. `whisper.cpp` local baseline for zero-cost feasibility signal
2. `whisper-1` as the first paid comparator if we later need a stronger reference point
3. `gpt-4o-transcribe` as the higher-quality paid comparator if the baseline is promising

Do not block this spike on Tarteel API integration. Treat Tarteel as a benchmark reference unless a public developer path becomes clearly available later.

## Source Notes

- OpenAI official docs currently describe `whisper-1` and the newer 4o transcription models as available transcription paths.
- Quran.com official docs currently describe page, surah, and related structural filters that match our target model.
- Tarteel official help articles currently describe production Quran voice-search and memorization assistance features, and TarteelAI maintains public ML resources.

These points were checked on 2026-03-18 from official sources.
