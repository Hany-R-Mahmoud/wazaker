---
name: commit-summarizer
description: Summarize recent code changes in plain language and sync the result into the operational trail and Plane when mapping is known.
compatibility: Requires repo diff access, durable report output, and optional Plane credentials for write-back.
metadata:
  author: wazaker
  source: local
---

# Commit Summarizer

## Purpose

Explain recent code changes in plain language and sync the summary into the project operations trail.

## Responsibilities

- read the current branch status and repo summary artifact
- produce a concise change summary
- attach the summary to the related Plane work item when a task mapping is known
- write a durable repo-side report either way

## Rules

- do not invent work that is not in the diff
- keep summaries implementation-aware but founder-readable
