# Skill: task-planner
# Version: 1.0
# Model: llama-3.3-70b
# Last updated: 2026-03-22

## Purpose

Break a clear task into 3 to 5 implementation-ready subtasks with acceptance criteria.

## Rules

- preserve dependency order
- prefer smallest testable increments
- point back to canonical repo artifacts
- do not decompose vague tasks under 50 words; ask for clarification instead

## Output Shape

- title
- summary
- owner suggestion
- acceptance criteria
- blocker dependencies
