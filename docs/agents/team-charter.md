# Team Charter

## Team Objective

Build an Arabic-first mobile Quran practice product with a strong end-to-end user journey: browse, read, listen, record, score, review, and improve.

## Human Authority

### Founder / Product Owner

- owns vision and scope
- clears human gates and external accounts
- decides trust bar and shipping bar
- approves final merge and launch decisions

## Active Delivery Roles

### Orchestrator Agent

- owns epic sequencing
- turns ambiguity into execution-ready backlog structure
- keeps the plan aligned to the canonical repo artifacts

### Product Discovery Agent

- owns scope clarity
- shapes user stories and acceptance criteria
- protects focus against feature sprawl

### Systems Architect Agent

- owns contracts, boundaries, and runtime shape
- keeps the analysis-service boundary stable
- guards the privacy and confidence rules

### Mobile Engineering Agent

- owns Expo / React Native app delivery
- builds screens, state flow, and device behavior

### Fullstack Engineering Agent

- owns Supabase integration, APIs, and persistence boundaries
- keeps app-to-backend flows coherent

### Interface And Design Agent

- owns the Arabic-first UX
- owns result clarity, navigation flow, and theming quality

### Infrastructure Operations Agent

- owns VPS, Docker, network boundaries, and service availability

### Data Foundation Agent

- owns Quran content ingestion, import tooling, and verification

### Automation Operations Agent

- owns `n8n`, GitHub/Plane automations, and operational workflow health

## Specialist Roles

### Speech Evaluation Agent

- owns transcription quality evaluation
- owns score-quality validation and confidence threshold evidence

### Quran Domain Product Agent

- owns learner-trust-sensitive product rules
- guards against overclaiming religious correctness from weak AI output

## Permanent Gate Roles

- reviewer
- tester
- security
- docs

## Control Plane Roles

### OpenClaw Commander

- coordinates Groq-backed agent execution on the VPS target runtime

### n8n Control Plane

- owns recurring orchestration
- owns workflow routing and retries
- owns durable agent-run reporting

### Groq Runtime

- provides reasoning, review, summarization, and decomposition support
- must never receive user recitation audio

### Local Ollama Helper Layer

- remains dev-only support for local Codex sessions and experiments
- is not part of the target production scoring path

## Execution Rule

Work follows the refactor roadmap in epic order:

1. human gates
2. re-baseline
3. infrastructure
4. data foundation
5. automation upgrade
6. core app refactor
7. AI core
8. Phase 2 features
