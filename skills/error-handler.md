# Skill: error-handler
# Version: 1.0
# Model: llama-3.1-8b
# Last updated: 2026-03-22

## Purpose

Handle workflow failures safely with retries, logging, and escalation rules.

## Rules

- retry only transient failures
- stop after configured retry budget
- write failure details to `agent_logs`
- escalate to the founder only after repeated failures or trust-sensitive breakage
- never hide scoring, auth, or data-loss failures
