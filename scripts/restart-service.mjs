#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { runCommand } from './lib/automation-platform.mjs';

const service = process.argv[2];

if (!service) {
  process.stderr.write('Usage: node ./scripts/restart-service.mjs <service>\n');
  process.exit(1);
}

async function restartOllama() {
  const existing = await runCommand('pgrep', ['-af', 'ollama']);
  if (existing.code === 0 && existing.stdout.trim()) {
    return { action: 'noop', reason: 'ollama already appears to be running' };
  }

  const child = spawn('ollama', ['serve'], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
  return { action: 'spawned', pid: child.pid };
}

async function restartN8n() {
  const result = await runCommand('docker', ['restart', 'n8n']);
  return {
    action: result.code === 0 ? 'restarted' : 'failed',
    exitCode: result.code,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

async function restartRunner() {
  const result = await runCommand('bash', ['./scripts/automation-runner-start.sh']);
  return {
    action: result.code === 0 ? 'started' : 'failed',
    exitCode: result.code,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

let result;
if (service === 'ollama') {
  result = await restartOllama();
} else if (service === 'n8n') {
  result = await restartN8n();
} else if (service === 'automation-runner') {
  result = await restartRunner();
} else {
  process.stderr.write(`Unsupported service: ${service}\n`);
  process.exit(1);
}

process.stdout.write(
  JSON.stringify(
    {
      service,
      attemptedAt: new Date().toISOString(),
      ...result,
    },
    null,
    2,
  ),
);
