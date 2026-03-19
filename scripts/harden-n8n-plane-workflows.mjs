#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { repoRoot } from './lib/automation-platform.mjs';
import {
  PLANE_RETRY_POLICY,
  PLANE_WORKFLOW_HARDENING_CONFIG,
} from './lib/n8n-plane-workflow-config.mjs';

function main() {
  for (const config of PLANE_WORKFLOW_HARDENING_CONFIG) {
    try {
      const filePath = join(repoRoot, config.file);
      const workflows = JSON.parse(readFileSync(filePath, 'utf8'));
      if (!Array.isArray(workflows) || workflows.length === 0 || !workflows[0]) {
        process.stderr.write(`Skipping workflow hardening for ${config.file}: expected a non-empty workflow array.\n`);
        continue;
      }
      const workflow = workflows[0];
      if (!Array.isArray(workflow.nodes)) {
        process.stderr.write(`Skipping workflow hardening for ${config.file}: workflow.nodes is not an array.\n`);
        continue;
      }

      for (const node of workflow.nodes) {
        if (node.type === 'n8n-nodes-base.scheduleTrigger') {
          node.parameters ??= {};
          node.parameters.rule = { interval: [{ ...config.schedule }] };
        }

        if (config.fetchNodeName && node.name === config.fetchNodeName) {
          Object.assign(node, PLANE_RETRY_POLICY);
          node.parameters ??= {};
          node.parameters.options = {
            ...(node.parameters.options ?? {}),
            timeout: 60000,
          };
        }
      }

      writeFileSync(filePath, `${JSON.stringify(workflows, null, 2)}\n`, 'utf8');
    } catch (error) {
      const message = error instanceof Error ? error.stack ?? error.message : String(error);
      process.stderr.write(`Skipping workflow hardening for ${config.file}: ${message}\n`);
    }
  }
}

const entrypointHref = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';

if (import.meta.url === entrypointHref) {
  main();
}
