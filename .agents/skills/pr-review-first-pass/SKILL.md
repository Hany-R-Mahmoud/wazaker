---
name: pr-review-first-pass
description: Produce an advisory first-pass pull request review packet and hand off merge authority to the existing guarded review flow.
compatibility: Requires GitHub pull request payloads, durable report output, and optional comment-posting permissions.
metadata:
  author: wazaker
  source: local
---

# PR Review First Pass

## Purpose

Run a lightweight early review before the guarded merge loop.

## Responsibilities

- inspect changed files and risk areas
- flag likely issues in correctness, safety, and maintainability
- write a structured review packet
- hand off merge authority to the existing repo review guards

## Rules

- advisory only, not final merge approval
- prioritize high-signal findings over exhaustiveness
