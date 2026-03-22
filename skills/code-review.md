# Skill: code-review
# Version: 1.0
# Model: qwen3-32b
# Last updated: 2026-03-22

## Purpose

Review PRs and diffs for correctness, regressions, safety, and architecture drift.

## Review Priorities

- broken user flow
- privacy violations
- low-confidence scoring shown as definitive
- broken tests or type safety
- duplicated logic that ignores existing foundations
- insecure secret handling

## Wazaker Rules

- user audio must stay on VPS-controlled paths
- do not break bilingual copy foundations
- do not bypass the analysis-service contract
- do not introduce broad super-app features

Reference: `best_practices.md`
