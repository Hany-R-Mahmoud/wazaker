import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

async function runJsonScript(scriptPath) {
  const { stdout } = await execFile('node', [scriptPath], {
    cwd: process.cwd(),
  });
  return JSON.parse(stdout);
}

test('codebase map script emits a report payload', async () => {
  const result = await runJsonScript('./scripts/codebase-map.mjs');
  assert.equal(result.contextKey, 'codebase-map');
  assert.ok(Array.isArray(result.topLevelDirectories));
});

test('speech qa script emits ranking data', async () => {
  const result = await runJsonScript('./scripts/speech-qa-report.mjs');
  assert.equal(result.contextKey, 'speech-qa');
  assert.ok(result.providerCount >= 1);
  assert.ok(Array.isArray(result.rankedProviders));
});

test('ui consistency script emits metrics and status', async () => {
  const result = await runJsonScript('./scripts/ui-consistency-report.mjs');
  assert.equal(result.contextKey, 'ui-consistency');
  assert.ok(result.metrics);
  assert.ok(['pass', 'review'].includes(result.status));
});

test('health report script emits a health summary', async () => {
  const result = await runJsonScript('./scripts/service-health-report.mjs');
  assert.equal(result.contextKey, 'service-health');
  assert.ok(Array.isArray(result.failingServices));
});
