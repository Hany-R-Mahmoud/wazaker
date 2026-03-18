# ASR Local Baseline Findings

**Date**: 2026-03-18  
**Evaluator**: Codex + local Mac setup  
**Sample Set**: 3 real recordings from the Phase 2 short-passage manifest  
**Compared Providers**:

- `whisper.cpp` with `ggml-base`
- `whisper.cpp` with `ggml-small`

## Executive Summary

The free local baseline is useful for feasibility learning but not strong enough yet for trustworthy learner-facing recitation correction.

`ggml-small` materially improved over `ggml-base`, which is encouraging. But even the stronger local run remains far below the confidence bar needed to present specific revision feedback safely.

## Quantitative Comparison

| Model | Average normalized WER | Fatiha | Ikhlas | Baqarah 1-5 |
|---|---:|---:|---:|---:|
| `ggml-base` | 0.823 | 0.724 | 0.800 | 0.944 |
| `ggml-small` | 0.627 | 0.448 | 0.600 | 0.833 |

## What Improved

- Fatiha improved significantly with the `small` model.
- Ikhlas improved as well, especially in preserving more of the core structure.
- The local runner is now stable on CPU mode and usable for repeatable experiments.

## What Is Still Weak

- The model still inserts non-trivial errors into even the correct Fatiha sample.
- The longer ayah-range sample remains far too noisy for reliable mismatch labeling.
- Pauses and repeated phrases still distort the transcript shape enough to confuse downstream scoring.
- The system is not yet close to the trust bar defined in the feasibility plan.

## Product Interpretation

This is not a product failure. It is a useful spike outcome:

- the key-free local route can generate evidence
- the harness and scoring workflow are now working
- but the current local Whisper baseline is not good enough to support learner-facing correction claims

## Recommendation

**Recommendation: Proceed with narrower scope, but do not expose correction-quality claims from this local baseline.**

Specifically:

1. Keep using the local harness for cheap comparative experiments.
2. Treat `ggml-small` as the minimum local reference point, not `ggml-base`.
3. Do not build learner-facing correction logic on top of these current outputs.
4. If we want the AI-recitation feature to be the real product core, we likely need either:
   - a stronger hosted transcription path, or
   - a more domain-specific Quran/Arabic model path

## Immediate Next Step

Compare one stronger option next:

- either a stronger free/local model tier
- or, if budget becomes available later, one hosted comparator against the same sample set

Meanwhile, the mobile app can continue against the mock analysis contract without pretending the recognition problem is solved.
