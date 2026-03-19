---
name: speech-qa
description: Track ASR and recitation-quality regressions using local benchmark outputs, durable reports, and shared context updates.
compatibility: Requires benchmark artifacts under benchmarks/asr and repo-side reporting paths.
metadata:
  author: wazaker
  source: local
---

# Speech QA

## Purpose

Protect the Quran recitation speech pipeline from silent regression.

## Responsibilities

- read benchmark outputs from local ASR runs
- compare provider quality and sample-level drift
- identify the worst passages and likely failure patterns
- write a durable QA report and shared context snapshot
