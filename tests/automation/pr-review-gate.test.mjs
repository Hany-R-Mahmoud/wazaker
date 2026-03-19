import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluatePrReviewGate } from '../../scripts/lib/pr-review-gate.mjs';

test('review gate blocks merge while CodeRabbit is pending', () => {
  const gate = evaluatePrReviewGate(
    {
      statusCheckRollup: 'CodeRabbit review in progress pending',
      comments: [{ author: { login: 'coderabbitai[bot]' }, body: 'Review in progress' }],
      latestReviews: [],
      reviews: [],
    },
    [],
    { requireBotActivity: true },
  );

  assert.equal(gate.blockingBotReviewPending, true);
  assert.equal(gate.clearToMerge, false);
});

test('review gate blocks merge when actionable bot comments remain', () => {
  const gate = evaluatePrReviewGate(
    {
      statusCheckRollup: 'CodeRabbit completed',
      comments: [{ author: { login: 'coderabbitai[bot]' }, body: 'All done' }],
      latestReviews: [],
      reviews: [],
    },
    [{ id: 'comment-1' }],
    { requireBotActivity: true },
  );

  assert.equal(gate.botActivitySeen, true);
  assert.equal(gate.actionableBotThreadCount, 1);
  assert.equal(gate.clearToMerge, false);
});

test('review gate allows merge only after bot activity with no pending state or actionable comments', () => {
  const gate = evaluatePrReviewGate(
    {
      statusCheckRollup: 'CodeRabbit completed successfully',
      comments: [],
      latestReviews: [{ author: { login: 'qodo-merge[bot]' } }],
      reviews: [],
      mergeStateStatus: 'CLEAN',
    },
    [],
    { requireBotActivity: true },
  );

  assert.equal(gate.botActivitySeen, true);
  assert.equal(gate.blockingBotReviewPending, false);
  assert.equal(gate.clearToMerge, true);
});
