# MVP Scope

## Phase 1 Launch Scope

- Arabic-first mobile app with English support
- user authentication through Supabase Auth
- home dashboard
- Surah browser
- Mushaf reading view
- word-by-word Quran text rendering
- Al-Husary reference audio playback per ayah
- ayah-focused recording flow
- AI-scored recitation feedback with confidence bands
- session history
- basic progress visibility
- dark and light theme support

## Phase 2 Scope

- memorization mode with hidden text
- goals and streaks
- mistake history
- progress trends and summary views
- voice search as a later exploratory feature

## Explicitly Out Of Scope For Phases 1 And 2

- prayer times
- qibla
- azkar
- social sharing
- commerce or store
- teacher marketplace
- advanced tajweed rule engine
- leaderboards
- multi-qari support
- offline-first full Quran download

## Launch Success Criteria

- a signed-in user can browse a Surah and open a Mushaf screen
- the user can play reference audio for an ayah
- the user can record a recitation attempt for that ayah
- the app can return a word-level result with correct, incorrect, and uncertain states
- low-confidence words are shown as uncertain rather than wrong
- the recitation result is saved and visible in session history

## Highest-Risk Assumptions

- the Whisper-based transcription and scoring path can produce useful ayah-level results without violating the trust bar
- the QUL reference data is sufficient for Al-Husary-aligned scoring and playback
- the VPS can support the production path for a small early cohort without requiring a larger infrastructure jump

## Delivery Rules

- Preserve the analysis-service boundary; only the implementation behind it changes.
- Preserve the typed Zod domain model where possible.
- Preserve the bilingual copy system and feature-first structure.
- User audio must remain inside the VPS-controlled pipeline.
- Any word below the confidence threshold must render as uncertain, not incorrect.
