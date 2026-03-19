#!/usr/bin/env node

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './lib/automation-platform.mjs';

const workflowDir = join(repoRoot, 'automation', 'n8n');
const workflowFiles = readdirSync(workflowDir)
  .filter((entry) => entry.endsWith('.json'))
  .sort();

const ids = new Set();
const names = new Set();
const errors = [];

for (const file of workflowFiles) {
  const fullPath = join(workflowDir, file);
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(fullPath, 'utf8'));
  } catch (error) {
    errors.push(`${file}: invalid JSON (${error instanceof Error ? error.message : 'unknown error'})`);
    continue;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    errors.push(`${file}: workflow export must be a non-empty array`);
    continue;
  }

  for (const workflow of parsed) {
    if (!workflow.id || !workflow.name) {
      errors.push(`${file}: workflow missing id or name`);
      continue;
    }
    if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
      errors.push(`${file}: workflow ${workflow.id} has no nodes`);
    }
    if (ids.has(workflow.id)) {
      errors.push(`${file}: duplicate workflow id ${workflow.id}`);
    }
    if (names.has(workflow.name)) {
      errors.push(`${file}: duplicate workflow name ${workflow.name}`);
    }
    ids.add(workflow.id);
    names.add(workflow.name);
  }
}

if (errors.length > 0) {
  process.stderr.write(`${errors.join('\n')}\n`);
  process.exit(1);
}

process.stdout.write(
  JSON.stringify(
    {
      workflowCount: workflowFiles.length,
      files: workflowFiles,
    },
    null,
    2,
  ),
);
