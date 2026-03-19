# Error Handler

## Purpose

Catch automation failures, preserve evidence, and retry safely when possible.

## Responsibilities

- record the failing workflow and input context
- trigger health checks after repeated failures
- retry only idempotent actions
- escalate when recovery would be unsafe or ineffective
