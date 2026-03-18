# Normalization Rules

These rules define how expected Quran text and recognized transcript text should be normalized before scoring.

## Goals

- reduce noise from orthographic variation
- preserve meaningful learner-facing mismatch detection
- keep the first spike simple and reproducible

## Rules for Phase 2

1. Remove tatweel.
2. Remove Arabic tashkeel marks for the first scoring pass.
3. Normalize alif variants `آ`, `أ`, `إ`, and `ٱ` to bare alif `ا`.
4. Normalize `ى` to `ي`.
5. Normalize `ة` to `ه` for the first pass.
6. Normalize hamza-on-carrier variants `ؤ` -> `و` and `ئ` -> `ي` for ASR scoring consistency with `normalize_text`.
7. Remove punctuation and decorative Quranic symbols, including superscript alif `ٰ`.
8. Collapse repeated whitespace.
9. Trim leading and trailing whitespace.

## Known Tradeoff

These rules are intentionally aggressive. They help us answer a feasibility question, but they are not final learner-facing rendering rules. If the spike succeeds, we can tighten normalization later so the product remains respectful to canonical orthography in the UI while still using normalized forms for scoring.

## Basmala Rule

For the first spike, treat basmala as part of the expected text only when it is explicitly included in the target fixture. Do not auto-insert or auto-remove it during scoring.

## Repeats And Restarts

Do not try to interpret repeated self-correction intelligently in the first pass. Let repeated tokens count as noise and capture them in the qualitative notes.
