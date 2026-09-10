import { expect, it } from 'vitest';

import type { WorkItem } from '@/domain/work-items/work-item';

import { buildDashboardSummary } from './build-dashboard-summary';

const base: WorkItem = {
  id: 'base',
  externalId: 'BASE',
  source: 'jira',
  title: 'Base',
  description: '',
  status: 'new',
  priority: 'medium',
  createdAt: '2026-09-08T09:00:00Z',
  updatedAt: '2026-09-09T09:00:00Z',
  externalUrl: 'https://example.com',
};

const items: WorkItem[] = [
  {
    ...base,
    id: '1',
    priority: 'critical',
    dueAt: '2026-09-09T12:30:00Z',
  },
  {
    ...base,
    id: '2',
    source: 'salesforce',
    priority: 'high',
    dueAt: '2026-09-09T15:00:00Z',
  },
  {
    ...base,
    id: '3',
    source: 'email',
    status: 'resolved',
    updatedAt: '2026-09-09T08:00:00Z',
  },
  {
    ...base,
    id: '4',
    status: 'resolved',
    updatedAt: '2026-09-08T23:59:00Z',
  },
];

it('returns operational counts, source totals, and the priority slice', () => {
  const summary = buildDashboardSummary(
    items,
    new Date('2026-09-09T12:00:00Z'),
  );

  expect(summary.metrics).toEqual({
    pending: 2,
    urgent: 1,
    approachingSla: 1,
    completedToday: 1,
  });
  expect(summary.bySource).toEqual({
    jira: 2,
    salesforce: 1,
    email: 1,
  });
  expect(summary.topItems.map((item) => item.id)).toEqual(['1', '2']);
});
