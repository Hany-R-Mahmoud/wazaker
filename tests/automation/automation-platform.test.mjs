import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, rmSync } from 'node:fs';

import {
  contextPathForKey,
  readContext,
  sanitizeContextKey,
  updateContext,
  validateReportPath,
  writeContext,
} from '../../scripts/lib/automation-platform.mjs';

test('sanitizeContextKey accepts safe keys', () => {
  assert.equal(sanitizeContextKey('codebase-map'), 'codebase-map');
  assert.equal(sanitizeContextKey('repo.status'), 'repo.status');
});

test('sanitizeContextKey rejects unsafe keys', () => {
  assert.throws(() => sanitizeContextKey('../escape'));
  assert.throws(() => sanitizeContextKey('bad/key'));
});

test('validateReportPath keeps writes under docs/automation', () => {
  const safePath = validateReportPath('health/example.md');
  assert.match(safePath, /docs\/automation\/health\/example\.md$/);
  assert.throws(() => validateReportPath('../../escape.md'));
  assert.throws(() => validateReportPath('../automation-evil/report.md'));
});

test('writeContext persists and reads shared context', () => {
  const key = 'test-context';
  const contextFile = contextPathForKey(key);
  if (existsSync(contextFile)) {
    rmSync(contextFile);
  }

  const written = writeContext(key, { hello: 'world' });
  assert.equal(written.key, key);
  assert.deepEqual(readContext(key)?.value, { hello: 'world' });

  rmSync(contextFile);
});

test('updateContext merges changes while keeping existing keys', () => {
  const key = 'test-context-update';
  const contextFile = contextPathForKey(key);
  if (existsSync(contextFile)) {
    rmSync(contextFile);
  }

  // Arrange
  writeContext(key, { alpha: 1 });

  // Act
  const updated = updateContext(key, (currentValue) => ({
    ...(currentValue ?? {}),
    beta: 2,
  }));

  // Assert
  assert.deepEqual(updated?.value, { alpha: 1, beta: 2 });

  rmSync(contextFile);
});
