# Plane Workflow Reactivation Smoke Test

Generated: 2026-03-19

## Repo Changes Applied

- enforced explicit PR review gate artifacts before merge
- blocked merges while CodeRabbit or Qodo is still pending
- blocked merges while actionable bot review threads remain unresolved
- hardened Plane polling workflows with retry/backoff
- widened the most aggressive schedule intervals before reactivation

## Live Manual Smoke Runs

These workflows were executed through the live `n8n` run API after the hardened workflow definitions were imported:

| Workflow ID | Result |
| --- | --- |
| `CtxMgrRefresh01` | success |
| `SpeechQa01` | success |
| `UiConsistency01` | success |
| `DpSmryDurable03` | success |
| `PlnBklgAudit02` | success |
| `PlnTaskExpand01` | success |
| `PlnTaskDecomp01` | success |
| `PlnStaleTask01` | success |
| `ReleaseNotes01` | success |
| `SprintRetro01` | success |
| `PlnGuardedDelivery01` | success |

## Live Reactivation State

All of the workflows above were republished as active and the `n8n` container was restarted afterward so the running scheduler would pick up the new definitions.

## Remaining Validation Gap

The first naturally scheduled production execution after reactivation is still pending for the daily, weekly, and multi-hour workflows. Manual smoke runs are complete and green, but the first scheduler-owned confirmation must still be observed in live `n8n` execution history.
