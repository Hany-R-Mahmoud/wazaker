---
name: error-handler
description: Capture automation failures, preserve evidence, retry only safe actions, and escalate when autonomous recovery is unsafe.
compatibility: Requires automation health signals, durable report paths, and approved recovery actions.
metadata:
  author: wazaker
  source: local
---

# Error Handler

## Purpose

Catch automation failures, preserve evidence, and retry safely when possible.

## Responsibilities

- record the failing workflow and input context
- trigger health checks after repeated failures
- retry only idempotent actions
- escalate when recovery would be unsafe or ineffective
