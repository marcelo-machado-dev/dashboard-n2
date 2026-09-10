import type { WorkItem } from '@/domain/work-items/work-item';

export interface WorkItemRepository {
  findAll(): Promise<WorkItem[]>;
}
