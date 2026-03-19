import test from 'node:test';
import assert from 'node:assert/strict';

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
