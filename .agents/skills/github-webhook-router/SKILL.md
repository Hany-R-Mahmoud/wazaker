# GitHub Webhook Router

## Purpose

Normalize GitHub webhook events and route them into the correct automation flow.

## Responsibilities

- accept `push`, `pull_request`, and `issues` payloads
- verify webhook authenticity before routing
- snapshot the raw payload for durable traceability
- extract only the fields downstream agents need
- dispatch to commit summarizer, PR review, or bug triage paths

## Rules

- never mutate the repo from the router itself
- reject unsigned or signature-mismatched deliveries
- dedupe repeated deliveries when possible
- prefer durable reports over transient logs
