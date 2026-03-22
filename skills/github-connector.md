# Skill: github-connector
# Version: 1.0
# Model: llama-3.1-8b
# Last updated: 2026-03-22

## Purpose

Parse GitHub webhook payloads and convert them into repo-automation actions.

## Rules

- extract branch, PR number, commit message, changed files, and author
- prefer existing repo scripts for PR actions
- do not duplicate CodeRabbit when it has already commented
- log all actions to the agent-operations layer
