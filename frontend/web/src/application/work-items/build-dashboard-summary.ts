import type {
  WorkItem,
  WorkItemSource,
} from '@/domain/work-items/work-item';
import { classifySla } from '@/domain/work-items/sla';

import { filterAndSortWorkItems } from './filter-and-sort-work-items';
import { defaultWorkQueueQuery } from './work-queue-query';

export function buildDashboardSummary(items: WorkItem[], now = new Date()) {
  const activeItems = items.filter((item) => item.status !== 'resolved');
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const bySource: Record<WorkItemSource, number> = {
    jira: 0,
    salesforce: 0,
    email: 0,
  };

  items.forEach((item) => {
    bySource[item.source] += 1;
  });

  return {
    metrics: {
      pending: activeItems.length,
      urgent: activeItems.filter((item) => item.priority === 'critical').length,
      approachingSla: activeItems.filter(
        (item) => classifySla(item.dueAt, now) === 'approaching',
      ).length,
      completedToday: items.filter(
        (item) =>
          item.status === 'resolved' && new Date(item.updatedAt) >= startOfDay,
      ).length,
    },
    bySource,
    topItems: filterAndSortWorkItems(
      activeItems,
      defaultWorkQueueQuery,
    ).slice(0, 5),
  };
}
