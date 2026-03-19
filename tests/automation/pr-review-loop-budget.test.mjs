import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
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

  try {
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
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
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

test('review loop budget keeps canonical event metadata when payload overlaps', () => {
  const state = applyEvent(
    createInitialState({ prNumber: 19, branchName: 'codex/test-branch' }),
    'trigger',
    {
      type: 'spoofed',
      at: '2000-01-01T00:00:00.000Z',
      url: 'https://example.test/review/2',
    },
  );

  assert.equal(state.history.length, 1);
  assert.equal(state.history[0].type, 'trigger');
  assert.notEqual(state.history[0].at, '2000-01-01T00:00:00.000Z');
});

test('review loop budget show command ignores malformed extra payload args', () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'review-budget-show-'));
  const statePath = path.join(tempDir, 'state.json');

  try {
    saveState(statePath, createInitialState({ prNumber: 19, branchName: 'codex/test-branch' }));

    const result = spawnSync(
      process.execPath,
      ['scripts/lib/pr-review-loop-budget.mjs', statePath, 'show', '{not-json'],
      {
        cwd: path.join(process.cwd()),
        encoding: 'utf8',
      },
    );

    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.prNumber, 19);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});
