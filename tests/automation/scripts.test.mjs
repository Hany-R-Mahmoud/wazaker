import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile as execFileCallback } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

async function runJsonScript(scriptPath, options = {}) {
  const { stdout } = await execFile('node', [scriptPath], {
    cwd: options.cwd ?? process.cwd(),
    env: {
      ...process.env,
      ...options.env,
    },
  });
  return JSON.parse(stdout);
}

test('codebase map script emits a report payload', async () => {
  const result = await runJsonScript('./scripts/codebase-map.mjs');
  assert.equal(result.contextKey, 'codebase-map');
  assert.ok(Array.isArray(result.topLevelDirectories));
});

test('speech qa script emits ranking data', async () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'wazaker-speech-qa-'));
  try {
    const fixtureDir = join(fixtureRoot, 'benchmarks', 'asr', 'runs', 'provider-a');
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(
      join(fixtureDir, 'results.json'),
      JSON.stringify({
        provider: 'provider-a',
        sampleCount: 1,
        averageWordErrorRate: 0.12,
        samples: [
          {
            sampleId: 'sample-1',
            passageLabel: 'Fixture Passage',
            wordErrorRate: 0.12,
          },
        ],
      }),
      'utf8',
    );

    const result = await runJsonScript('./scripts/speech-qa-report.mjs', {
      env: {
        AUTOMATION_BENCHMARK_ROOT: fixtureRoot,
      },
    });
    assert.equal(result.contextKey, 'speech-qa');
    assert.ok(result.providerCount >= 1);
    assert.ok(Array.isArray(result.rankedProviders));
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
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
