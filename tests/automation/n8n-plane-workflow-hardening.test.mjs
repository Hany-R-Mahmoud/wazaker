import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { repoRoot } from '../../scripts/lib/automation-platform.mjs';
import {
  PLANE_RETRY_POLICY,
  PLANE_WORKFLOW_HARDENING_CONFIG,
} from '../../scripts/lib/n8n-plane-workflow-config.mjs';

test('plane workflow hardening config - workflow fixtures are checked - schedules and retries stay hardened', () => {
  // Arrange
  const workflowConfigs = PLANE_WORKFLOW_HARDENING_CONFIG;

  // Act
  for (const config of workflowConfigs) {
    const workflows = JSON.parse(readFileSync(join(repoRoot, config.file), 'utf8'));
    assert.ok(Array.isArray(workflows) && workflows.length > 0, `${config.file} must export a non-empty workflow array fixture`);
    const workflow = workflows[0];
    const scheduleNode = workflow.nodes.find((node) => node.type === 'n8n-nodes-base.scheduleTrigger');

    // Assert
    assert.ok(scheduleNode, `${config.file} is missing a schedule trigger`);
    assert.deepEqual(scheduleNode.parameters?.rule?.interval, [{ ...config.schedule }]);

    if (!config.fetchNodeName) {
      continue;
    }

    const fetchNode = workflow.nodes.find((node) => node.name === config.fetchNodeName);
    assert.ok(fetchNode, `${config.file} is missing fetch node ${config.fetchNodeName}`);
    assert.equal(fetchNode.retryOnFail, PLANE_RETRY_POLICY.retryOnFail);
    assert.equal(fetchNode.maxTries, PLANE_RETRY_POLICY.maxTries);
    assert.equal(fetchNode.waitBetweenTries, PLANE_RETRY_POLICY.waitBetweenTries);
    assert.equal(fetchNode.parameters?.options?.timeout, 60000);
  }
});
