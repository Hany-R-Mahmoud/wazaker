# System Overview

## Goal

Deliver an Arabic-first mobile Quran practice system where a learner can browse a Surah, read the Mushaf, play reference audio, record a target ayah, receive confidence-aware feedback, and review the result history.

## Runtime Split

### Local Mac

Development-only environment:

- Expo dev server
- Codex sessions
- local validation
- optional local Ollama helpers for developer workflows

The Mac is not part of the production scoring path.

### VPS Runtime

Target production runtime for the early cohort:

- `n8n` for workflow orchestration
- OpenClaw as the agent commander
- self-hosted Supabase for auth, database, and storage
- Whisper.cpp service for Arabic transcription
- internal Docker network connecting production services

## Primary Components

### Mobile Client

- Expo / React Native app
- authentication flow
- home dashboard
- Surah browser
- Mushaf reader
- reference audio playback
- recording UI
- result rendering
- session history

### Quran Content Layer

- Surah metadata
- Quran word-by-word text
- Al-Husary reference audio
- word-level timestamp data

### Analysis Layer

- audio upload and job creation
- Whisper transcription
- normalized Arabic comparison
- confidence gating
- score calculation
- learner-facing word results

### App Data Layer

- Supabase Auth
- user profiles
- recitation sessions
- reference content metadata
- agent and workflow logs

## Architectural Boundaries

### Preserve

- the typed recitation domain model
- the analysis-service abstraction boundary
- the feature-first app structure
- bilingual copy and theme systems

### Expand

- move from local-only history assumptions to Supabase-backed user data
- move from fixture-only target selection to Surah and ayah-backed selection
- move from local mock scoring to VPS-hosted asynchronous scoring

## Primary Data Flow

1. User signs in.
2. User opens a Surah and selects an ayah to practice.
3. User listens to reference audio if needed.
4. User records the ayah.
5. App uploads audio to Supabase Storage and creates a pending session.
6. `n8n` routes the session to the Whisper scoring workflow.
7. Scoring results are written back to Supabase.
8. App polls through the preserved analysis-service boundary and renders the result.

## Non-Negotiable Safety Rules

- low-confidence words must never be shown as definitely wrong
- user audio must stay inside the VPS-controlled runtime
- Groq and other external LLMs must never receive user recitation audio
