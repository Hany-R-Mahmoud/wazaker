import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateOpenPullRequest } from '../../scripts/lib/pr-sweep.mjs';

test('pr sweep skips draft pull requests', () => {
  const result = evaluateOpenPullRequest(
    {
      number: 1,
      draft: true,
      head: { ref: 'codex/test', repo: { owner: { login: 'Hany-R-Mahmoud' } } },
    },
    'Hany-R-Mahmoud',
  );

  assert.deepEqual(result, { eligible: false, reason: 'draft' });
});

test('pr sweep skips forked or unknown owners', () => {
  const result = evaluateOpenPullRequest(
    {
      number: 2,
      draft: false,
      head: { ref: 'codex/test', repo: { owner: { login: 'someone-else' } } },
    },
    'Hany-R-Mahmoud',
  );

  assert.deepEqual(result, { eligible: false, reason: 'fork-or-unknown-owner' });
});

test('pr sweep accepts same-repo non-draft branches', () => {
  const result = evaluateOpenPullRequest(
    {
      number: 3,
      title: 'Ready PR',
      html_url: 'https://example.test/pr/3',
      draft: false,
      head: { ref: 'codex/ready', repo: { owner: { login: 'Hany-R-Mahmoud' } } },
    },
    'Hany-R-Mahmoud',
  );

  assert.deepEqual(result, {
    eligible: true,
    reason: 'eligible',
    branch: 'codex/ready',
    number: 3,
    title: 'Ready PR',
    url: 'https://example.test/pr/3',
  });
});

test('pr sweep skips PRs targeting main as head branch', () => {
  const result = evaluateOpenPullRequest(
    {
      number: 4,
      draft: false,
      head: { ref: 'main', repo: { owner: { login: 'Hany-R-Mahmoud' } } },
    },
    'Hany-R-Mahmoud',
  );

  assert.deepEqual(result, { eligible: false, reason: 'invalid-head-branch' });
});
