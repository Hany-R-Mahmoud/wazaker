#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { repoRoot } from './lib/automation-platform.mjs';
import { planeRetryPolicy, planeWorkflowHardeningConfig } from './lib/n8n-plane-workflow-config.mjs';

for (const config of planeWorkflowHardeningConfig) {
  const filePath = join(repoRoot, config.file);
  const workflows = JSON.parse(readFileSync(filePath, 'utf8'));
  const workflow = workflows[0];

  for (const node of workflow.nodes) {
    if (node.type === 'n8n-nodes-base.scheduleTrigger') {
      node.parameters ??= {};
      node.parameters.rule = { interval: [{ ...config.schedule }] };
    }

    if (config.fetchNodeName && node.name === config.fetchNodeName) {
      Object.assign(node, planeRetryPolicy);
      node.parameters ??= {};
      node.parameters.options = {
        ...(node.parameters.options ?? {}),
        timeout: 60000,
      };
    }
  }

  writeFileSync(filePath, `${JSON.stringify(workflows, null, 2)}\n`, 'utf8');
}
