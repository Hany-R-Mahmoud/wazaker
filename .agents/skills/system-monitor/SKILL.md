---
name: system-monitor
description: Monitor the local automation stack, classify health, attempt safe restarts, and preserve durable health reports.
compatibility: Requires service-health checks and approved restart hooks for local automation services.
metadata:
  author: wazaker
  source: local
---

# System Monitor

## Purpose

Keep the local automation stack healthy.

## Responsibilities

- check `automation-runner`, `n8n`, `Ollama`, and repo availability
- classify health as healthy, degraded, or failed
- attempt safe restarts only for approved services
- write durable reports before escalating

## Inputs

- current service-health snapshot
- last failed services from context
- recent recovery attempts

## Output

- a concise health report
- restart recommendations or actions
- escalation note only when self-heal failed
