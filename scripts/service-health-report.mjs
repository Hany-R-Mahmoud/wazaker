#!/usr/bin/env node

import { getServiceHealth, writeContext, writeReport } from './lib/automation-platform.mjs';

const health = await getServiceHealth();
const timestamp = new Date().toISOString().replace(/[:]/g, '-');
const reportRelativePath = `health/${timestamp}.md`;

const lines = [
  '# Automation Health Report',
  '',
  `Generated: ${health.checkedAt}`,
  `Overall healthy: ${health.ok ? 'yes' : 'no'}`,
  '',
  '## Services',
  '',
];

for (const [name, service] of Object.entries(health.services)) {
  lines.push(`### ${name}`);
  lines.push('');
  lines.push(`- Healthy: ${service.ok ? 'yes' : 'no'}`);
  lines.push(`- Restartable: ${service.restartable ? 'yes' : 'no'}`);
  lines.push('```json');
  lines.push(JSON.stringify(service.details, null, 2));
  lines.push('```');
  lines.push('');
}

writeReport(reportRelativePath, lines.join('\n'));
writeContext('service-health', health);

process.stdout.write(
  JSON.stringify(
    {
      ...health,
      reportRelativePath,
      contextKey: 'service-health',
    },
    null,
    2,
  ),
);
