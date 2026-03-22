# wazaker

Arabic-first mobile app for Quran recitation practice and memorization, with guided reference audio, ayah-focused recording, and confidence-aware AI feedback.

## Current Focus

The project has been re-baselined around a Tarteel-inspired Phase 1 launch for a small early user cohort.

Phase 1 target:

- user authentication
- home dashboard
- Surah browser
- Mushaf reading experience
- Al-Husary reference audio playback
- ayah-by-ayah recording
- AI-scored feedback with confidence gating
- session history and basic progress visibility
- Arabic-first UI with English support

Phase 2 target:

- memorization mode
- goals and streaks
- progress trends
- mistake history

## Source Of Truth

- Product: `docs/product/`
- Architecture: `docs/architecture/`
- Research: `docs/research/`
- Team and workflow: `docs/agents/`
- Refactor roadmap: `docs/product/roadmap-v2.md`
- Design links and workflow: `design/links.md`

## Non-Goals For Phases 1 And 2

- prayer times
- qibla
- azkar
- social sharing
- commerce
- teacher marketplace
- advanced tajweed rule engine
- leaderboards

## Immediate Next Steps

1. Finish the repo-side refactor baseline and Plane backlog sync.
2. Clear the human gates for VPS, Groq, Plane, and QUL access.
3. Stand up the target infrastructure on the VPS.
4. Import Quranic content and reference-audio metadata into Supabase.
5. Refactor the app toward the new end-to-end Phase 1 flow.

## Delivery Rules

- This repo is not greenfield; preserve working foundations that already pay off.
- The analysis-service interface remains a protected architectural boundary.
- `npm test` and `npm run typecheck` must stay green after every implementation task.
- User audio must stay on the VPS in production workflows.
- Low-confidence AI results must never be shown as definitive corrections.

## Spec Kit

Spec Kit is installed and initialized for this repository with `codex` support.

To use the generated prompt commands from this repo context:

```sh
export CODEX_HOME="$PWD/.codex"
```

Primary commands:

- `/speckit.constitution`
- `/speckit.specify`
- `/speckit.clarify`
- `/speckit.plan`
- `/speckit.tasks`
- `/speckit.implement`

Project-specific Spec Kit assets live in:

- `.specify/`
- `.codex/prompts/`
- `.agents/skills/`

## GitHub Flow

This repository uses a PR-first workflow.

- start from `main`
- create a feature branch
- push and open a PR
- resolve review comments on the same branch
- merge only after review approval
- sync local `main`

Reference: [docs/setup/github-flow.md](docs/setup/github-flow.md)
