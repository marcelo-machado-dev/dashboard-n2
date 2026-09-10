import type {
  WorkItem,
  WorkItemPriority,
} from '@/domain/work-items/work-item';

import type { WorkQueueQuery } from './work-queue-query';

const priorityRank: Record<WorkItemPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function includesSearch(item: WorkItem, search: string) {
  const term = search.trim().toLocaleLowerCase('pt-BR');
  if (!term) return true;

  return [item.externalId, item.title, item.customer, item.assignee]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLocaleLowerCase('pt-BR').includes(term));
}

function dueAtTimestamp(item: WorkItem) {
  return item.dueAt
    ? new Date(item.dueAt).getTime()
    : Number.POSITIVE_INFINITY;
}

export function filterAndSortWorkItems(
  items: WorkItem[],
  query: WorkQueueQuery,
) {
  return items
    .filter((item) => includesSearch(item, query.search))
    .filter((item) => query.source === 'all' || item.source === query.source)
    .filter((item) => query.status === 'all' || item.status === query.status)
    .filter(
      (item) => query.priority === 'all' || item.priority === query.priority,
    )
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      if (query.sort === 'updated') {
        return (
          new Date(right.item.updatedAt).getTime() -
            new Date(left.item.updatedAt).getTime() ||
          left.index - right.index
        );
      }

      if (query.sort === 'sla') {
        return (
          dueAtTimestamp(left.item) - dueAtTimestamp(right.item) ||
          left.index - right.index
        );
      }

      return (
        priorityRank[left.item.priority] -
          priorityRank[right.item.priority] ||
        dueAtTimestamp(left.item) - dueAtTimestamp(right.item) ||
        left.index - right.index
      );
    })
    .map(({ item }) => item);
}
