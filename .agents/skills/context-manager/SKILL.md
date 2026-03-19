---
name: context-manager
description: Maintain structured shared automation memory so workflows can coordinate through durable facts instead of transient state.
compatibility: Requires write access to .automation/context and repo-side durable reports.
metadata:
  author: wazaker
  source: local
---

# Context Manager

## Purpose

Maintain shared automation memory so workflows do not contradict one another.

## Responsibilities

- persist structured context in `.automation/context/`
- track active branches, delivery runs, summaries, and recent decisions
- expose stable keys for other agents to read and update
- keep context machine-readable and compact

## Rules

- update context only after writing the underlying report or artifact
- prefer append-safe snapshots over destructive replacement
- store facts and decisions, not speculative reasoning
