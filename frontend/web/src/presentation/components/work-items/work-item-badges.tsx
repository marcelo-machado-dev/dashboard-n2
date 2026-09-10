import { Badge, Group } from '@mantine/core';

import type {
  WorkItemPriority,
  WorkItemSource,
  WorkItemStatus,
} from '@/domain/work-items/work-item';
import {
  classifySla,
  formatDuration,
  getRemainingSlaMs,
} from '@/domain/work-items/sla';

const sourceLabels: Record<WorkItemSource, string> = {
  jira: 'Jira',
  salesforce: 'Salesforce',
  email: 'E-mail',
};

const statusLabels: Record<WorkItemStatus, string> = {
  new: 'Novo',
  in_progress: 'Em andamento',
  waiting: 'Aguardando',
  resolved: 'Resolvido',
};

const statusColors: Record<WorkItemStatus, string> = {
  new: 'blue',
  in_progress: 'violet',
  waiting: 'orange',
  resolved: 'green',
};

const priorityLabels: Record<WorkItemPriority, string> = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

const priorityColors: Record<WorkItemPriority, string> = {
  critical: 'red',
  high: 'orange',
  medium: 'yellow',
  low: 'gray',
};

export function SourceBadge({ source }: { source: WorkItemSource }) {
  return (
    <Badge variant="light" color="gray">
      {sourceLabels[source]}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: WorkItemStatus }) {
  return (
    <Badge variant="light" color={statusColors[status]}>
      {statusLabels[status]}
    </Badge>
  );
}

export function PriorityBadge({
  priority,
}: {
  priority: WorkItemPriority;
}) {
  return (
    <Badge variant="dot" color={priorityColors[priority]}>
      {priorityLabels[priority]}
    </Badge>
  );
}

export function SlaBadge({
  dueAt,
  now = new Date(),
}: {
  dueAt?: string;
  now?: Date;
}) {
  const state = classifySla(dueAt, now);

  if (state === 'unavailable') {
    return (
      <Badge variant="light" color="gray">
        Sem SLA
      </Badge>
    );
  }

  const colors = {
    critical: 'red',
    approaching: 'orange',
    healthy: 'green',
  } as const;

  return (
    <Badge variant="light" color={colors[state]}>
      {formatDuration(getRemainingSlaMs(dueAt, now) ?? 0)}
    </Badge>
  );
}

export function WorkItemBadgeGroup({
  source,
  status,
  priority,
}: {
  source: WorkItemSource;
  status: WorkItemStatus;
  priority: WorkItemPriority;
}) {
  return (
    <Group gap={6}>
      <SourceBadge source={source} />
      <StatusBadge status={status} />
      <PriorityBadge priority={priority} />
    </Group>
  );
}
