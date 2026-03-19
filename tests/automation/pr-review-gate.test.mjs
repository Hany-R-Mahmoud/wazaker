import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { evaluatePrReviewGate } from '../../scripts/lib/pr-review-gate.mjs';

test('evaluatePrReviewGate - CodeRabbit pending state - blocks merge', () => {
  // Arrange
  const prStatus = {
    statusCheckRollup: 'CodeRabbit review in progress pending',
    comments: [{ author: { login: 'coderabbitai[bot]' }, body: 'Review in progress' }],
    latestReviews: [],
    reviews: [],
  };

  // Act
  const gate = evaluatePrReviewGate(
    prStatus,
    [],
    { requireBotActivity: true },
  );

  // Assert
  assert.equal(gate.blockingBotReviewPending, true);
  assert.equal(gate.clearToMerge, false);
});

test('evaluatePrReviewGate - structured pending rollup - blocks merge', () => {
  // Arrange
  const prStatus = {
    statusCheckRollup: [{ context: 'CodeRabbit', state: 'pending', description: 'Review in progress' }],
    comments: [],
    latestReviews: [{ author: { login: 'coderabbitai[bot]' } }],
    reviews: [],
  };

  // Act
  const gate = evaluatePrReviewGate(
    prStatus,
    [],
    { requireBotActivity: true },
  );

  // Assert
  assert.equal(gate.blockingBotReviewPending, true);
  assert.ok(gate.pendingSignals.some((signal) => signal.startsWith('coderabbit:')));
  assert.equal(gate.clearToMerge, false);
});

test('evaluatePrReviewGate - actionable bot comments remain - blocks merge', () => {
  // Arrange
  const prStatus = {
    statusCheckRollup: 'CodeRabbit completed',
    comments: [{ author: { login: 'coderabbitai[bot]' }, body: 'All done' }],
    latestReviews: [],
    reviews: [],
  };
  const actionableBotComments = [{ id: 'comment-1' }];

  // Act
  const gate = evaluatePrReviewGate(
    prStatus,
    actionableBotComments,
    { requireBotActivity: true },
  );

  // Assert
  assert.equal(gate.botActivitySeen, true);
  assert.equal(gate.actionableBotThreadCount, 1);
  assert.equal(gate.clearToMerge, false);
});

test('evaluatePrReviewGate - bot review completed with no blockers - allows merge', () => {
  // Arrange
  const prStatus = {
    statusCheckRollup: 'CodeRabbit completed successfully',
    comments: [],
    latestReviews: [{ author: { login: 'qodo-merge[bot]' } }],
    reviews: [],
    mergeStateStatus: 'CLEAN',
  };

  // Act
  const gate = evaluatePrReviewGate(
    prStatus,
    [],
    { requireBotActivity: true },
  );

  // Assert
  assert.equal(gate.botActivitySeen, true);
  assert.equal(gate.blockingBotReviewPending, false);
  assert.equal(gate.clearToMerge, true);
});

test('evaluatePrReviewGate - deduplicates repeated bot authors', () => {
  // Arrange
  const prStatus = {
    statusCheckRollup: '',
    comments: [{ author: { login: 'coderabbitai[bot]' }, body: 'done' }],
    latestReviews: [{ author: { login: 'coderabbitai[bot]' } }],
    reviews: [{ author: { login: 'coderabbitai[bot]' } }],
    mergeStateStatus: 'CLEAN',
  };

  // Act
  const gate = evaluatePrReviewGate(prStatus, [], { requireBotActivity: true });

  // Assert
  assert.deepEqual(gate.botAuthors, ['coderabbitai[bot]']);
});

test('evaluatePrReviewGate - allows merge when bot activity is optional', () => {
  // Arrange
  const prStatus = {
    statusCheckRollup: '',
    comments: [],
    latestReviews: [],
    reviews: [],
    mergeStateStatus: 'CLEAN',
  };

  // Act
  const gate = evaluatePrReviewGate(
    prStatus,
    [],
    { requireBotActivity: false },
  );

  // Assert
  assert.equal(gate.botActivitySeen, false);
  assert.equal(gate.clearToMerge, true);
});

test('pr-review-gate CLI rejects malformed PR status payloads', () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'pr-review-gate-'));
  const invalidPrStatusPath = path.join(tempDir, 'pr-status.json');

  writeFileSync(
    invalidPrStatusPath,
    JSON.stringify({
      mergeStateStatus: 'CLEAN',
      comments: [],
      latestReviews: [],
      reviews: [],
    }),
  );

  const result = spawnSync(
    process.execPath,
    ['scripts/pr-review-gate.mjs', invalidPrStatusPath],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
    },
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /reviewDecision must be a string or null/);
});

test('pr-review-gate CLI accepts nullable GitHub fields', () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'pr-review-gate-'));
  const prStatusPath = path.join(tempDir, 'pr-status.json');

  writeFileSync(
    prStatusPath,
    JSON.stringify({
      mergeStateStatus: 'CLEAN',
      reviewDecision: null,
      statusCheckRollup: null,
      comments: [],
      latestReviews: [],
      reviews: [],
    }),
  );

  const result = spawnSync(
    process.execPath,
    ['scripts/pr-review-gate.mjs', prStatusPath],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
});

test('pr-review-gate CLI reports a missing PR status file', () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'pr-review-gate-'));
  const missingPrStatusPath = path.join(tempDir, 'missing-pr-status.json');

  const result = spawnSync(
    process.execPath,
    ['scripts/pr-review-gate.mjs', missingPrStatusPath],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
    },
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, new RegExp(`PR status file not found: ${missingPrStatusPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
});

test('pr-review-gate CLI fails closed on malformed comments JSON', () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'pr-review-gate-'));
  const prStatusPath = path.join(tempDir, 'pr-status.json');
  const commentsPath = path.join(tempDir, 'comments.json');

  writeFileSync(
    prStatusPath,
    JSON.stringify({
      mergeStateStatus: 'CLEAN',
      reviewDecision: 'APPROVED',
      comments: [],
      latestReviews: [],
      reviews: [],
    }),
  );
  writeFileSync(commentsPath, '{not valid json');

  const result = spawnSync(
    process.execPath,
    ['scripts/pr-review-gate.mjs', prStatusPath, commentsPath],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
    },
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Could not read JSON file/);
});

test('pr-review-gate CLI fails closed when a supplied comments file is missing', () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'pr-review-gate-'));
  const prStatusPath = path.join(tempDir, 'pr-status.json');
  const missingCommentsPath = path.join(tempDir, 'missing-comments.json');

  writeFileSync(
    prStatusPath,
    JSON.stringify({
      mergeStateStatus: 'CLEAN',
      reviewDecision: 'APPROVED',
      comments: [],
      latestReviews: [],
      reviews: [],
    }),
  );

  const result = spawnSync(
    process.execPath,
    ['scripts/pr-review-gate.mjs', prStatusPath, missingCommentsPath],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
    },
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, new RegExp(`Comments file not found: ${missingCommentsPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
});
