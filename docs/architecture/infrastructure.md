# Infrastructure Target

## Purpose

Document the production-target runtime that the 2026-03-22 refactor points toward.

## Target Runtime

- Hostinger VPS as the first production host
- Docker-managed services on an internal network
- `n8n` for workflow orchestration
- OpenClaw for Groq-backed agent routing
- self-hosted Supabase for auth, database, and storage
- Whisper.cpp service for Arabic transcription

## Trust And Privacy Boundaries

- User recitation audio stays inside the VPS-controlled runtime.
- Groq and other external LLM providers do not receive user recitation audio.
- Supabase and Whisper.cpp stay on the internal service network.
- Public ingress is limited to the app-facing and operator-facing endpoints that are required.

## Migration Notes

- The checked-in local automation stack remains the developer baseline during migration.
- Production scoring moves from fixture-backed behavior to Supabase upload, workflow processing, and polling.
- Repo docs remain canonical while Plane mirrors execution state.

## Related Docs

- `docs/architecture/system-overview.md`
- `docs/architecture/audio-pipeline.md`
- `docs/setup/automation-operating-model.md`
