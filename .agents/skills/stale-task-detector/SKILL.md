---
name: stale-task-detector
description: Detect Plane work items that have stopped moving and recommend archive, split, reprioritize, or unblock actions.
compatibility: Requires Plane task snapshots or mirrored backlog data plus durable report output.
metadata:
  author: wazaker
  source: local
---

# Stale Task Detector

## Purpose

Identify Plane work items that have stopped moving and need a decision.

## Responsibilities

- detect tasks with no meaningful movement over the configured threshold
- group them by priority and owner
- recommend archive, split, reprioritize, or unblock actions
- write a durable report instead of making silent backlog changes
