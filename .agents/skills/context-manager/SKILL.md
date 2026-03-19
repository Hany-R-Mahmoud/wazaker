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
