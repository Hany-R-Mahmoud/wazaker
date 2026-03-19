# Agent Gap Analysis

Date: 2026-03-19

## Purpose

Map the generic checklist artifact against the actual `wazaker` setup so we can:

- mark what already exists
- avoid rebuilding duplicate agents
- define the missing agent and workflow plan

## Current Control Model

The repo already uses a layered model instead of a flat "one box per agent" design:

- `n8n` is the runtime orchestrator for recurring and integration-driven flows
- `automation-runner` is the safe bridge into repo scripts
- repo scripts are the source of truth for guarded operations
- Codex skills handle high-judgment planning, implementation, review, and testing
- `Ollama` handles low-risk summaries, ranking, and draft expansion

This means several checklist items should be treated as workflow capabilities, not as brand-new standalone agents.

## Checklist Mapping

| Checklist Agent | Status | Current Equivalent | Gap |
|---|---|---|---|
| Health Monitor Agent | Need | Status scripts exist for `automation-runner` | No auto-heal workflow for `Ollama`, `n8n`, runner, Docker |
| GitHub Webhook Listener | Need | Scheduled PR workflows exist | No webhook-first event intake for push, PR, issue events |
| Plane Sync Agent | Have | `scripts/plane-sync-backlog.sh`, `scripts/plane-dedupe-backlog.sh`, `ProjAutoMaint01` | None for current backlog sync path |
| Commit Summarizer Agent | Partial | `GhPrSmry01` writes durable PR/commit summaries | Does not currently write back to Plane automatically |
| PR Review Agent | Partial | PR supervisor, `pr_autofinish`, CodeRabbit/agent-review flows | No dedicated local-LLM review agent posting first-pass PR review comments |
| Bug Triage Agent | Need | None | No GitHub issue -> severity/epic/routing automation |
| Code Context Agent | Partial | agent roster, operating model, repo docs, Codex skills | No durable machine-readable codebase map for other automations |
| Daily Standup Agent | Have | `DpSmryDurable03` | Already live as daily Plane summary |
| Task Decomposer Agent | Partial | `PlnTaskExpand01` | Generates expansion drafts, but not real subtasks or Plane write-back |
| Stale Task Detector | Need | None | No stale-task scan or reprioritization prompt |
| Sprint Retrospective Agent | Need | None | No end-of-sprint summary workflow |
| Feature Spec Agent | Have | `speckit-clarify`, `speckit-specify`, `speckit-plan`, `speckit-tasks`, `speckit-analyze` | Already stronger than the checklist version |
| Whisper / Speech QA Agent | Need | Permanent specialist role `speech-evaluation` exists | No automated audio regression workflow yet |
| UI Consistency Agent | Need | Manual design and review skills exist | No push-triggered UI/design-system audit automation |
| Release Notes Agent | Need | None | No milestone-close release notes workflow |
| Master Orchestrator | Have | `n8n` + documented operating model + guarded delivery pipeline | Already exists at system level |
| Context Manager Agent | Partial | durable reports, Plane mirror, docs, roster | No shared-memory service or canonical structured context store |
| Error Recovery Agent | Need | Basic workflow failures visible in `n8n` and runner logs | No explicit retry/escalation/self-heal workflow |

## What We Already Have

### Strong existing foundation

- `n8n` orchestration model is already documented
- `automation-runner` is already implemented
- Plane backlog sync and dedupe already exist
- guarded Plane-to-PR delivery already exists
- PR publish / autofinish / summary automations already exist
- spec-driven feature definition already exists
- team role routing is already documented

### Important implication

Do not create new "master orchestrator" or "feature spec agent" from scratch.

Instead:

- treat `n8n` as the orchestrator runtime
- treat Codex skills as the specialist execution team
- add missing event listeners, memory layers, QA flows, and reporting workflows around that foundation

## Recommended Agent Model

### Runtime Orchestration Layer

- `n8n`: event intake, schedules, retries, branching, durable reports
- `automation-runner`: safe repo action execution
- `Ollama`: low-risk drafting and classification

### Codex Specialist Layer

- orchestrator: planning and routing
- product-discovery: shaping work
- systems-architect: contracts and boundaries
- mobile-engineering: app implementation
- fullstack-engineering: integrations and services
- interface-and-design: UX and UI decisions
- speech-evaluation: ASR and recitation quality
- reviewer / tester / security / docs: gates

### Missing Automation Layer To Add

- event listener workflows
- shared context store
- recovery and health supervision
- product-ops summarizers
- app-specific QA agents

## Creation Plan

Build in this order.

### Phase 1: Close infrastructure gaps

1. Health Monitor Agent
   Role:
   keep `n8n`, `automation-runner`, `Ollama`, and Docker healthy

   Tasks:
   - check process and container health
   - detect failed or missing services
   - restart allowed services
   - write health reports
   - escalate only after repeated failure

   n8n shape:
   - schedule every 5 minutes
   - call runner health endpoints or shell-backed checks
   - write `docs/automation/health/`

2. GitHub Webhook Listener
   Role:
   become the event-first intake path for GitHub changes

   Tasks:
   - receive `push`, `pull_request`, and `issues` events
   - normalize payload
   - route to summarizer, PR review, or bug triage flows
   - dedupe repeated deliveries

   n8n shape:
   - `Webhook` trigger
   - router node by event type
   - durable payload snapshots under `docs/automation/github-events/`

3. Context Manager
   Role:
   store machine-readable shared context across workflows

   Tasks:
   - persist current branch, active delivery run, latest summaries, task-to-PR links
   - store accepted task expansions and agent decisions
   - expose lookup endpoints for other workflows

   n8n shape:
   - start with file-backed JSON in `.automation/context/`
   - later move to SQLite if needed

### Phase 2: Upgrade code intelligence

4. Commit Summarizer Agent
   Role:
   summarize pushes and sync the summary back to the related Plane item

   Tasks:
   - read diff or latest branch changes
   - generate plain-English summary
   - attach summary to Plane item or report

   Build note:
   extend `GhPrSmry01`, do not replace it

5. PR Review Agent
   Role:
   run a lightweight first-pass automated review before the guarded merge loop

   Tasks:
   - inspect changed files
   - classify risk areas
   - post structured review notes
   - hand off to existing review gates

   Build note:
   keep CodeRabbit and repo guards as the source of truth for merge decisions

6. Bug Triage Agent
   Role:
   classify incoming issues and map them to Plane

   Tasks:
   - severity classification
   - duplicate hinting
   - owner label suggestion
   - Plane epic / work-item suggestion

7. Code Context Agent
   Role:
   expose a lightweight codebase map to automation workflows

   Tasks:
   - summarize key modules
   - track feature folders and ownership
   - refresh on demand or nightly
   - provide lookup for "where should this change go?"

### Phase 3: Project operations

8. Task Decomposer write-back
   Role:
   convert current expansion drafts into accepted structured subtasks

   Tasks:
   - detect approval markers
   - create subtasks in Plane
   - link back to draft report

9. Stale Task Detector
   Role:
   identify work items that are open but not moving

   Tasks:
   - scan last update age
   - group by risk and priority
   - generate prompts for archive, split, or reprioritize

10. Sprint Retrospective Agent
    Role:
    summarize sprint output, misses, and blockers

    Tasks:
    - compare planned vs completed items
    - highlight carryover
    - compute basic velocity trends

11. Release Notes Agent
    Role:
    generate milestone release notes from Plane and GitHub artifacts

    Tasks:
    - collect completed tasks
    - collect merged PR summaries
    - generate publish-ready markdown

### Phase 4: App-specific specialists

12. Whisper / Speech QA Agent
    Role:
    protect the recitation evaluation pipeline from silent regressions

    Tasks:
    - run sample audio fixtures
    - compare transcription output
    - measure drift and failure cases
    - write QA report

13. UI Consistency Agent
    Role:
    check UI changes against the project design system and mobile UX rules

    Tasks:
    - inspect changed UI files
    - flag inconsistent spacing, typography, tokens, or interaction patterns
    - route risky changes to design review

## Suggested Skill Files To Create

These should be the repo-local skill prompts that back the missing agents:

- `.agents/skills/system-monitor/SKILL.md`
- `.agents/skills/github-webhook-router/SKILL.md`
- `.agents/skills/context-manager/SKILL.md`
- `.agents/skills/commit-summarizer/SKILL.md`
- `.agents/skills/pr-review-first-pass/SKILL.md`
- `.agents/skills/bug-triage/SKILL.md`
- `.agents/skills/codebase-map/SKILL.md`
- `.agents/skills/stale-task-detector/SKILL.md`
- `.agents/skills/sprint-retro/SKILL.md`
- `.agents/skills/release-notes/SKILL.md`
- `.agents/skills/speech-qa/SKILL.md`
- `.agents/skills/ui-consistency/SKILL.md`

## n8n Workflow Backlog

Recommended workflow files to add under `automation/n8n/`:

- `n8n-health-monitor.json`
- `n8n-github-webhook-router.json`
- `n8n-github-issue-triage.json`
- `n8n-code-context-refresh.json`
- `n8n-stale-task-detector.json`
- `n8n-sprint-retrospective.json`
- `n8n-release-notes-generator.json`
- `n8n-speech-qa-regression.json`
- `n8n-ui-consistency-audit.json`

## Role Assignment Summary

| Role | Owns |
|---|---|
| `n8n` | orchestration, schedules, webhooks, retries, durable reports |
| `automation-runner` | guarded execution of repo actions |
| `Ollama` | summary, ranking, draft expansion, first-pass classification |
| Codex orchestrator skills | planning, routing, decision framing |
| Codex engineering skills | implementation, review, testing, documentation |
| specialist app agents | speech QA and UI consistency for domain-specific risk |

## Immediate Next Moves

1. Build `Context Manager` first so later workflows share one memory shape.
2. Build `GitHub Webhook Listener` next so push / PR / issue flows stop relying only on polling.
3. Extend the existing PR summary flow into `Commit Summarizer + Plane write-back`.
4. Add `Bug Triage Agent` as the first issue-driven workflow.
5. Add `Health Monitor` and `Error Recovery` before increasing automation complexity.

