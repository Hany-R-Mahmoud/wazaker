#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot, writeContext, writeReport } from './lib/automation-platform.mjs';

const appPath = join(repoRoot, 'App.tsx');
const source = readFileSync(appPath, 'utf8');

const findings = [];
const pressableCount = (source.match(/<Pressable\b/g) || []).length;
const accessibilityLabelCount = (source.match(/accessibilityLabel=/g) || []).length;
const colorLiteralCount = (source.match(/#[0-9A-Fa-f]{3,8}/g) || []).length;
const tokenColorCount = (source.match(/colors\./g) || []).length;
const hasSafeAreaView = source.includes('<SafeAreaView');
const hasScrollView = source.includes('<ScrollView');
const hasBilingualComponent = source.includes('function BilingualLine');

if (pressableCount > accessibilityLabelCount) {
  findings.push({
    severity: 'medium',
    rule: 'interactive-accessibility',
    message: 'Interactive Pressable elements outnumber accessibility labels.',
  });
}

if (!hasSafeAreaView) {
  findings.push({
    severity: 'high',
    rule: 'safe-area',
    message: 'Top-level layout is missing SafeAreaView.',
  });
}

if (!hasBilingualComponent) {
  findings.push({
    severity: 'medium',
    rule: 'bilingual-pattern',
    message: 'No shared bilingual text primitive detected.',
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  file: 'App.tsx',
  metrics: {
    pressableCount,
    accessibilityLabelCount,
    colorLiteralCount,
    tokenColorCount,
    hasSafeAreaView,
    hasScrollView,
    hasBilingualComponent,
  },
  findings,
  status: findings.length === 0 ? 'pass' : 'review',
};

const reportRelativePath = `ui-consistency/${report.generatedAt.replace(/[:]/g, '-')}.md`;
const lines = [
  '# UI Consistency Audit',
  '',
  `Generated: ${report.generatedAt}`,
  `Status: ${report.status}`,
  '',
  '## Metrics',
  '',
  ...Object.entries(report.metrics).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Findings',
  '',
  ...(findings.length === 0
    ? ['No consistency issues detected by the current heuristics.']
    : findings.map((finding) => `- [${finding.severity}] ${finding.rule}: ${finding.message}`)),
];

writeReport(reportRelativePath, lines.join('\n'));
writeContext('ui-consistency', report);

process.stdout.write(
  JSON.stringify(
    {
      ...report,
      reportRelativePath,
      contextKey: 'ui-consistency',
    },
    null,
    2,
  ),
);
