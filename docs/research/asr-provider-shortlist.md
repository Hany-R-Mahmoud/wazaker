# ASR Provider Shortlist

## Decision Summary

For the first feasibility spike, we should start with a key-free local path and avoid betting the project on a paid API or a third-party Quran-specific hosted API unless that access becomes clearly available.

## Candidate Matrix

| Candidate | Strength | Risk | Spike Role | Recommendation |
|---|---|---|---|---|
| `whisper.cpp` local baseline | Free to run after model download, fast enough for short local experiments, no API key required | Lower quality than stronger hosted models, local setup friction | First key-free baseline | Test first |
| `whisper-1` | Mature baseline, richer transcription outputs, easy first experiment | Generic ASR may underperform on Quran recitation | Baseline for alignment-heavy evaluation | Test first |
| `gpt-4o-transcribe` | Better documented quality than original Whisper family | More limited response controls for alignment-heavy workflows | Quality comparator | Test second |
| Tarteel hosted capabilities | Strong Quran product signal in official help content | No clearly verified public developer API found in this pass | Benchmark inspiration only | Do not depend on it yet |
| Self-hosted Quran-fine-tuned research models | Domain specificity is attractive | Higher ops burden, lower short-term speed, unclear reproducibility | Later fallback if hosted paths fail | Defer |

## Why Local First

- It keeps the feasibility spike moving with zero API spend.
- It gives us a real baseline instead of staying stuck in mock-only mode.
- It lets us validate normalization, alignment, and scoring before we pay for quality comparisons.

## Why OpenAI Second

- OpenAI remains the cleanest paid comparator if we later decide the local baseline is promising but too weak.
- The spike harness should stay provider-agnostic so we can add hosted comparisons later without redesigning the evaluation workflow.

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
- the local key-free baseline is too weak to provide useful signal
