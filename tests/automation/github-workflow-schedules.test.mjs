import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { repoRoot } from '../../scripts/lib/automation-platform.mjs';

function readSchedule(filePath) {
  const workflows = JSON.parse(readFileSync(join(repoRoot, filePath), 'utf8'));
  const workflow = workflows[0];
  const scheduleNode = workflow.nodes.find((node) => node.type === 'n8n-nodes-base.scheduleTrigger');

  assert.ok(scheduleNode, `${filePath} is missing a schedule trigger`);
  return scheduleNode.parameters?.rule?.interval;
}

function readWorkflowCode(filePath, nodeName) {
  const workflows = JSON.parse(readFileSync(join(repoRoot, filePath), 'utf8'));
  const workflow = workflows[0];
  const codeNode = workflow.nodes.find((node) => node.name === nodeName);

  assert.ok(codeNode, `${filePath} is missing node ${nodeName}`);
  return String(codeNode.parameters?.jsCode || '');
}

test('github automation workflow schedules stay aligned with the repo operating model', () => {
  assert.deepEqual(
    readSchedule('automation/n8n/n8n-automation-baseline-heartbeat.json'),
    [{ field: 'minutes', minutesInterval: 10 }],
  );
  assert.deepEqual(
    readSchedule('automation/n8n/n8n-github-pr-automation-supervisor.json'),
    [{ field: 'minutes', minutesInterval: 10 }],
  );
  assert.deepEqual(
    readSchedule('automation/n8n/n8n-github-pr-and-commit-summary.json'),
    [{ field: 'hours', hoursInterval: 2 }],
  );
  assert.deepEqual(
    readSchedule('automation/n8n/n8n-github-open-pr-sweep.json'),
    [{ field: 'hours', hoursInterval: 1 }],
  );
  assert.deepEqual(
    readSchedule('automation/n8n/n8n-main-clean-check.json'),
    [{ field: 'hours', hoursInterval: 1 }],
  );
});

test('repo-wide PR workflows do not depend on the active local branch being clean main', () => {
  const sweepCode = readWorkflowCode('automation/n8n/n8n-github-open-pr-sweep.json', 'Launch Open PR Sweep');
  const mainCleanCode = readWorkflowCode('automation/n8n/n8n-main-clean-check.json', 'Promote Dirty Main Or Sweep PRs');

  assert.equal(sweepCode.includes('open PR sweep only runs from main'), false);
  assert.equal(sweepCode.includes('Working tree is not clean; refusing repo-wide PR sweep.'), false);
  assert.equal(mainCleanCode.includes('skipping dirty-main promotion but still launching the repo-wide PR sweep'), true);
});
