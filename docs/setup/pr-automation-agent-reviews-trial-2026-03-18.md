# PR Automation Trial: `agent-reviews`

## Why We Ran This Trial

Our existing PR workflow already opened PRs, triggered CodeRabbit and Codex, and merged when conditions were clean. The weak point was the review-response loop:

- bot comments were fetched inconsistently
- CodeRabbit status noise was mixed with real findings
- replying to review comments and resolving threads was brittle
- the old nested resolver path could trigger unnecessary no-op cycles

We tested [`agent-reviews`](https://github.com/pbakaus/agent-reviews) on a live Wazaker pull request to see whether it could replace the fragile GitHub review-thread handling.

## Trial Scope

- PR under test: `#7`
- Branch under test: `codex/local-asr-spike-harness`
- Review bots present: `coderabbitai`, `chatgpt-codex-connector`
- Goal: verify that a tool-driven loop can detect actionable bot review comments, reply to them, mark them resolved, and support automatic merge readiness

## What We Observed

### What Worked

`agent-reviews` successfully:

- listed unresolved bot comments on the PR
- exposed the exact actionable CodeRabbit feedback we needed
- let us reply directly to specific review comments
- resolved those review threads after the reply
- during a later verification pass, filtered out CodeRabbit trigger/status noise and still surfaced only the remaining real unresolved findings

This was materially more reliable than our custom GitHub thread parsing.

### What Did Not Work

The broader autofinish pipeline still called the older nested local resolver. During the trial, that older path:

- reran even when the substantive fixes were already present
- produced noisy extra cycles
- briefly created an accidental `.pyc` artifact during a no-op pass

We also observed that `agent-reviews` returns CodeRabbit "Review triggered" status comments, which are bot noise and should not be treated as actionable review findings.

## Trial Output

The trial produced three concrete decisions:

1. Keep the existing PR/open/merge shell.
2. Replace custom bot review-thread handling with `agent-reviews`.
3. Filter status-only bot comments out of the review loop so they do not block merge or trigger no-op fix passes.

## Changes We Are Making Based On The Trial

- `pr-watch.sh` now saves actionable bot review comments via `agent-reviews`
- `pr-thread-sync.sh` now replies to actionable bot comments and resolves them through `agent-reviews`
- `pr-check-unresolved.sh` now checks unresolved bot comments from filtered `agent-reviews` output
- `pr-resolve-review.sh` now consumes filtered actionable comments and only commits when real staged source changes exist
- `.gitignore` now explicitly ignores Python bytecode artifacts

## Expected Outcome

After this workflow change, the expected PR behavior is:

1. PR opens as usual.
2. CodeRabbit and Codex review as usual.
3. The workflow detects only actionable bot review feedback.
4. The agent fixes valid findings.
5. The workflow replies to the bot review comments and resolves them.
6. Human review threads, if any, still block merge.
7. If the PR is otherwise clean, merge proceeds automatically.

## Recommendation

Adopt `agent-reviews` as the default GitHub bot-review interface for Wazaker PR automation. Keep our repo-local scripts, but make them delegate review-comment detection and thread resolution to `agent-reviews` instead of custom parsing.
