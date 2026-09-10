import { describe, expect, it } from 'vitest';

import type { WorkItem } from '@/domain/work-items/work-item';

import { filterAndSortWorkItems } from './filter-and-sort-work-items';
import { defaultWorkQueueQuery } from './work-queue-query';

const items: WorkItem[] = [
  {
    id: '1',
    externalId: 'SP-10',
    source: 'jira',
    title: 'Validar acesso',
    description: '',
    status: 'in_progress',
    priority: 'high',
    customer: 'Orbe',
    assignee: 'Ana',
    createdAt: '2026-09-08T10:00:00Z',
    updatedAt: '2026-09-09T10:00:00Z',
    dueAt: '2026-09-09T13:00:00Z',
    externalUrl: 'https://example.com/jira/SP-10',
  },
  {
    id: '2',
    externalId: 'CASE-20',
    source: 'salesforce',
    title: 'Falha no faturamento',
    description: '',
    status: 'new',
    priority: 'critical',
    customer: 'ACME',
    assignee: 'Marcelo',
    createdAt: '2026-09-08T09:00:00Z',
    updatedAt: '2026-09-09T11:00:00Z',
    dueAt: '2026-09-09T12:30:00Z',
    externalUrl: 'https://example.com/salesforce/CASE-20',
  },
  {
    id: '3',
    externalId: 'MAIL-30',
    source: 'email',
    title: 'Enviar evidências',
    description: '',
    status: 'waiting',
    priority: 'medium',
    customer: 'Nimbus',
    assignee: 'Marcelo',
    createdAt: '2026-09-07T09:00:00Z',
    updatedAt: '2026-09-08T08:00:00Z',
    externalUrl: 'https://example.com/email/MAIL-30',
  },
];

describe('filterAndSortWorkItems', () => {
  it('searches across relevant fields without case sensitivity', () => {
    const result = filterAndSortWorkItems(items, {
      ...defaultWorkQueueQuery,
      search: 'acme',
    });

    expect(result.map((item) => item.id)).toEqual(['2']);
  });

  it('combines source, status, and priority filters', () => {
    const result = filterAndSortWorkItems(items, {
      source: 'jira',
      status: 'in_progress',
      priority: 'high',
      search: '',
      sort: 'urgency',
    });

    expect(result.map((item) => item.id)).toEqual(['1']);
  });

  it('sorts by urgency, SLA, and latest update', () => {
    expect(
      filterAndSortWorkItems(items, defaultWorkQueueQuery).map(
        (item) => item.id,
      ),
    ).toEqual(['2', '1', '3']);
    expect(
      filterAndSortWorkItems(items, {
        ...defaultWorkQueueQuery,
        sort: 'sla',
      }).map((item) => item.id),
    ).toEqual(['2', '1', '3']);
    expect(
      filterAndSortWorkItems(items, {
        ...defaultWorkQueueQuery,
        sort: 'updated',
      }).map((item) => item.id),
    ).toEqual(['2', '1', '3']);
  });
});
