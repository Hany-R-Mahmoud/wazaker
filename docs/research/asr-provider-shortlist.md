# ASR Provider Shortlist

## Decision Summary

For the first feasibility spike, we should test two OpenAI transcription paths and avoid betting the project on a third-party Quran-specific hosted API unless public developer access is clearly verified.

## Candidate Matrix

| Candidate | Strength | Risk | Spike Role | Recommendation |
|---|---|---|---|---|
| `whisper-1` | Mature baseline, richer transcription outputs, easy first experiment | Generic ASR may underperform on Quran recitation | Baseline for alignment-heavy evaluation | Test first |
| `gpt-4o-transcribe` | Better documented quality than original Whisper family | More limited response controls for alignment-heavy workflows | Quality comparator | Test second |
| Tarteel hosted capabilities | Strong Quran product signal in official help content | No clearly verified public developer API found in this pass | Benchmark inspiration only | Do not depend on it yet |
| Self-hosted Quran-fine-tuned research models | Domain specificity is attractive | Higher ops burden, lower short-term speed, unclear reproducibility | Later fallback if hosted paths fail | Defer |

## Why OpenAI First

- We already have a usable API path inside the team.
- The first spike needs speed, repeatability, and low integration friction.
- We can compare two OpenAI transcription options against the same sample set quickly.

## Why Not Depend on Tarteel First

- Official help content confirms strong product capabilities, which is useful strategically.
- Public ML repos confirm that Quran-specific research exists.
- What is still missing for us is a clearly verified public integration path for a hosted developer API.

That makes Tarteel valuable as a benchmark, but too risky as the first dependency.

## What Would Change This Recommendation

Move Tarteel into the first-class shortlist if one of these becomes true:

- clear public developer docs appear for a hosted API
- a direct partnership or private access path exists
- the OpenAI-based spike fails to reach our minimum usefulness threshold
