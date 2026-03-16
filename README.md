# wazaker

Mobile app to help Quran learners read, revise, and assess recitation with AI support.

## Current Focus

Phase 1 is narrowly scoped to the recitation revision experience:

- select a passage or page
- recite from memory
- compare recitation against expected Quran text
- return clear, trustworthy feedback
- let the user retry and track progress

## Source Of Truth

- Product: `docs/product/`
- Architecture: `docs/architecture/`
- Research: `docs/research/`
- Team and workflow: `docs/agents/`
- Design links and workflow: `design/links.md`

## Non-Goals For V1

The following are explicitly out of scope for the first release:

- prayer times
- qibla
- azkar
- competitions
- store or commerce
- broad utility-app expansion

## Immediate Next Steps

1. Validate the recitation recognition approach on short passages.
2. Define the error taxonomy and feedback rules.
3. Design the mobile user flow for record, result, and retry.
4. Create the implementation backlog from the approved scope.

## Spec Kit

Spec Kit is installed and initialized for this repository with `codex` support.

To use the generated prompt commands from this repo context:

```sh
export CODEX_HOME=/Users/hanyramadan/wazaker/.codex
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
- create a `codex/*` branch
- push and open a PR
- resolve review comments on the same branch
- merge to `main`
- sync local `main`

Reference: [docs/setup/github-flow.md](/Users/hanyramadan/wazaker/docs/setup/github-flow.md)
