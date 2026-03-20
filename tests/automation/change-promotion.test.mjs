import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildChangeSlug,
  buildChangeSummary,
  describeChangedPath,
} from '../../scripts/lib/change-promotion.mjs';

test('describeChangedPath prefers the basename when it is already meaningful', () => {
  assert.equal(
    describeChangedPath('src/features/recitation/screens/recording-screen.tsx'),
    'recording-screen',
  );
});

test('describeChangedPath includes parent context for numeric or generic basenames', () => {
  assert.equal(
    describeChangedPath('docs/automation/plane-task-expansions/2026-03-20.md'),
    'plane-task-expansions-2026-03-20',
  );
  assert.equal(
    describeChangedPath('src/app/index.ts'),
    'app-index',
  );
  assert.equal(describeChangedPath('.gitignore'), '.gitignore');
  assert.equal(describeChangedPath('.prettierrc'), '.prettierrc');
});

test('buildChangeSlug compacts repeated tokens across related file names', () => {
  assert.equal(
    buildChangeSlug([
      'src/features/recitation/screens/recording-screen.tsx',
      'src/shared/i18n/recording-screen-copy.ts',
    ]),
    'recording-screen-copy',
  );
});

test('buildChangeSummary emits branch and commit metadata derived from changed files', () => {
  assert.deepEqual(
    buildChangeSummary([
      'src/features/recitation/screens/recording-screen.tsx',
      'src/shared/i18n/recording-screen-copy.ts',
    ]),
    {
      slug: 'recording-screen-copy',
      branchName: 'codex/auto/recording-screen-copy',
      commitMessage: 'chore: update recording screen copy',
      prTitle: 'chore: update recording screen copy',
    },
  );
});
