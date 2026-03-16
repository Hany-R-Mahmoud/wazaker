# wazaker Constitution

## Core Principles

### I. Trustworthy Recitation Feedback

Every user-facing correction must optimize for trust over apparent intelligence. The product must not overclaim confidence, must distinguish uncertain results clearly, and must avoid presenting speculative recognition output as certain Quran correction.

### II. Recitation First, Utility Creep Later

Phase 1 work must stay centered on the recitation revision workflow: select passage, record recitation, compare against expected text, return actionable feedback, and retry. Features outside that loop are out of scope unless they directly improve recitation learning.

### III. Arabic-First, Bilingual By Design

The app serves Quran learners with Arabic as the primary reading language while supporting English where it improves accessibility and onboarding. New product flows must preserve Arabic clarity first and avoid awkward translation-driven UX.

### IV. Mobile-First Simplicity

All flows are designed first for Expo/React Native mobile usage under real device constraints: microphone permissions, short sessions, uneven network quality, and low-friction retries. Architectural and UX decisions should prefer simpler mobile-operable solutions over broader but weaker abstractions.

### V. Evidence Before AI Claims

Recognition, alignment, and feedback behavior must be validated with real recordings and explicit evaluation criteria before being treated as production-ready. High-risk AI assumptions require measurable evidence, not optimistic planning.

## Product Constraints

- Stack baseline: Expo + React Native + TypeScript
- Product baseline: mobile app for Quran recitation revision
- Current source of truth for product and architecture remains `docs/`
- Design ideation lives in Stitch, approved design lives in Penpot
- Project management lives in Plane
- V1 excludes prayer times, qibla, azkar, commerce, competitions, and super-app expansion

## Development Workflow

- Use Spec Kit to turn new work into a specification, then a plan, then tasks before implementation when the change is non-trivial
- Prefer `/speckit.clarify` before planning when the feature has ambiguity that affects product scope or trust
- Keep implementation aligned with acceptance criteria in the relevant spec, not chat-only decisions
- TypeScript checks and relevant verification should pass before completion claims
- Architectural changes should be reflected in `docs/architecture/` and, when material, in an ADR

## Governance

This constitution governs product and implementation decisions for `wazaker`. If a requested change conflicts with these rules, scope or process must be corrected before work proceeds. Amendments require an explicit update to this file and a clear explanation of why the previous rule is no longer sufficient.

**Version**: 1.0.0 | **Ratified**: 2026-03-17 | **Last Amended**: 2026-03-17
