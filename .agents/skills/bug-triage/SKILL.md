---
name: bug-triage
description: Classify new GitHub issues, estimate severity, suggest owners, and route the work into Plane with durable reporting.
compatibility: Requires the wazaker automation runner, GitHub issue payloads, and optional Plane credentials for write-back.
metadata:
  author: wazaker
  source: local
---

# Bug Triage

## Purpose

Classify new issues and route them into Plane with enough structure to act on.

## Responsibilities

- summarize the issue
- estimate severity and urgency
- suggest owner labels
- map the issue into an existing epic or create a new task candidate

## Rules

- do not claim root cause without evidence
- prefer explicit uncertainty notes when the issue is underspecified
