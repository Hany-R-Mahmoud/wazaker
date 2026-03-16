# ASR Evaluation Plan

## Purpose

Evaluate whether the recitation analysis problem is feasible enough to support the MVP.

## Test Scope

Start with short, constrained passages:

- Al-Fatiha
- short surahs
- small ayah ranges from memorized passages

## Test Inputs

- multiple speakers
- different fluency levels
- real mobile microphone recordings
- pauses and self-corrections
- intentionally wrong recitations

## Evaluation Questions

- can the recognizer stay aligned to the expected passage
- does it misclassify pauses or restarts as errors
- which mismatch types are reliable enough to expose to users
- what confidence threshold is needed before showing feedback

## Output Required

- sample set description
- model/provider tested
- qualitative examples
- mismatch taxonomy performance
- recommendation: proceed, adjust scope, or stop
