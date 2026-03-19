import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { repoRoot } from '../../scripts/lib/automation-platform.mjs';
import {
  planeRetryPolicy,
  planeWorkflowHardeningConfig,
} from '../../scripts/lib/n8n-plane-workflow-config.mjs';

test('plane workflow schedules and retry policy stay hardened', () => {
  for (const config of planeWorkflowHardeningConfig) {
    const workflows = JSON.parse(readFileSync(join(repoRoot, config.file), 'utf8'));
    const workflow = workflows[0];
    const scheduleNode = workflow.nodes.find((node) => node.type === 'n8n-nodes-base.scheduleTrigger');

    assert.ok(scheduleNode, `${config.file} is missing a schedule trigger`);
    assert.deepEqual(scheduleNode.parameters?.rule?.interval, [{ ...config.schedule }]);

    if (!config.fetchNodeName) {
      continue;
    }

    const fetchNode = workflow.nodes.find((node) => node.name === config.fetchNodeName);
    assert.ok(fetchNode, `${config.file} is missing fetch node ${config.fetchNodeName}`);
    assert.equal(fetchNode.retryOnFail, planeRetryPolicy.retryOnFail);
    assert.equal(fetchNode.maxTries, planeRetryPolicy.maxTries);
    assert.equal(fetchNode.waitBetweenTries, planeRetryPolicy.waitBetweenTries);
    assert.equal(fetchNode.parameters?.options?.timeout, 60000);
  }
});
