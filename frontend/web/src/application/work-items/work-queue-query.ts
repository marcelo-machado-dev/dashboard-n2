import type {
  WorkItemPriority,
  WorkItemSource,
  WorkItemStatus,
} from '@/domain/work-items/work-item';

export type WorkQueueSort = 'urgency' | 'sla' | 'updated';

export type WorkQueueQuery = {
  search: string;
  source: WorkItemSource | 'all';
  status: WorkItemStatus | 'all';
  priority: WorkItemPriority | 'all';
  sort: WorkQueueSort;
};

export const defaultWorkQueueQuery: WorkQueueQuery = {
  search: '',
  source: 'all',
  status: 'all',
  priority: 'all',
  sort: 'urgency',
};
