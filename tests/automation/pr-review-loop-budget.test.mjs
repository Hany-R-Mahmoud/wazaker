import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  applyEvent,
  createInitialState,
  loadState,
  saveState,
} from '../../scripts/lib/pr-review-loop-budget.mjs';

test('review loop budget persists trigger and timeout counters', () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'review-budget-'));
  const statePath = path.join(tempDir, 'state.json');

  saveState(
    statePath,
    createInitialState({
      prNumber: 19,
      branchName: 'codex/test-branch',
      maxTriggerComments: 4,
      maxWatchTimeouts: 2,
    }),
  );

  saveState(statePath, applyEvent(loadState(statePath), 'trigger', { cycle: 1, url: 'https://example.test/review/1' }));
  saveState(statePath, applyEvent(loadState(statePath), 'watch-timeout', { cycle: 1 }));

  const finalState = JSON.parse(readFileSync(statePath, 'utf8'));
  assert.equal(finalState.prNumber, 19);
  assert.equal(finalState.triggerCommentCount, 1);
  assert.equal(finalState.watchTimeoutCount, 1);
  assert.equal(finalState.lastTriggerCommentUrl, 'https://example.test/review/1');
  assert.equal(finalState.history.length, 2);
});

test('review loop budget records manual stop reasons', () => {
  const blockedState = applyEvent(
    createInitialState({ prNumber: 19, branchName: 'codex/test-branch' }),
    'blocked',
    { reason: 'Reached CodeRabbit retrigger budget.' },
  );

  assert.equal(blockedState.manualActionRequired, true);
  assert.equal(blockedState.stopReason, 'Reached CodeRabbit retrigger budget.');
  assert.equal(blockedState.lastEvent, 'blocked');
});
