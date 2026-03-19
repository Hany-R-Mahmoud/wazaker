export const PLANE_WORKFLOW_HARDENING_CONFIG = [
  {
    file: 'automation/n8n/n8n-daily-plane-summary-managed-v2.json',
    fetchNodeName: 'Fetch Plane Work Items',
    schedule: { field: 'days', daysInterval: 1, triggerAtHour: 9, triggerAtMinute: 0 },
  },
  {
    file: 'automation/n8n/n8n-plane-backlog-quality-audit-v2.json',
    fetchNodeName: 'Fetch Plane Work Items',
    schedule: { field: 'days', daysInterval: 1, triggerAtHour: 9, triggerAtMinute: 30 },
  },
  {
    file: 'automation/n8n/n8n-plane-task-expansion-assistant.json',
    fetchNodeName: 'Fetch Plane Work Items',
    schedule: { field: 'days', daysInterval: 1, triggerAtHour: 10, triggerAtMinute: 0 },
  },
  {
    file: 'automation/n8n/n8n-plane-task-decomposer-writeback.json',
    fetchNodeName: 'Fetch Work Items',
    schedule: { field: 'days', daysInterval: 1, triggerAtHour: 10, triggerAtMinute: 45 },
  },
  {
    file: 'automation/n8n/n8n-stale-task-detector.json',
    fetchNodeName: 'Fetch Work Items',
    schedule: { field: 'days', daysInterval: 3, triggerAtHour: 11, triggerAtMinute: 30 },
  },
  {
    file: 'automation/n8n/n8n-release-notes-generator.json',
    fetchNodeName: 'Fetch Completed Items',
    schedule: { field: 'weeks', triggerAtDay: ['Thu'], triggerAtHour: 16, triggerAtMinute: 30 },
  },
  {
    file: 'automation/n8n/n8n-sprint-retrospective.json',
    fetchNodeName: 'Fetch Work Items',
    schedule: { field: 'weeks', triggerAtDay: ['Sun'], triggerAtHour: 18, triggerAtMinute: 0 },
  },
  {
    file: 'automation/n8n/n8n-plane-guarded-delivery-pipeline.json',
    fetchNodeName: 'Fetch Plane Work Items',
    schedule: { field: 'hours', hoursInterval: 4 },
  },
  {
    file: 'automation/n8n/n8n-context-manager-refresh.json',
    schedule: { field: 'hours', hoursInterval: 12 },
  },
  {
    file: 'automation/n8n/n8n-speech-qa-regression.json',
    schedule: { field: 'days', daysInterval: 1, triggerAtHour: 12, triggerAtMinute: 15 },
  },
  {
    file: 'automation/n8n/n8n-ui-consistency-audit.json',
    schedule: { field: 'days', daysInterval: 1, triggerAtHour: 13, triggerAtMinute: 15 },
  },
];

export const PLANE_RETRY_POLICY = {
  retryOnFail: true,
  maxTries: 5,
  waitBetweenTries: 60000,
};
