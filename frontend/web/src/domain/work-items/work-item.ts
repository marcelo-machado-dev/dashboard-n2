export type WorkItemSource = 'jira' | 'salesforce' | 'email';

export type WorkItemStatus =
  | 'new'
  | 'in_progress'
  | 'waiting'
  | 'resolved';

export type WorkItemPriority = 'critical' | 'high' | 'medium' | 'low';

export type WorkItem = {
  id: string;
  externalId: string;
  source: WorkItemSource;
  title: string;
  description: string;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  assignee?: string;
  customer?: string;
  createdAt: string;
  updatedAt: string;
  dueAt?: string;
  externalUrl: string;
};
