'use client';

import {
  Alert,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconFilterOff, IconRefresh, IconSearch } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

import { filterAndSortWorkItems } from '@/application/work-items/filter-and-sort-work-items';
import {
  defaultWorkQueueQuery,
  type WorkQueueQuery,
} from '@/application/work-items/work-queue-query';
import type { WorkItem } from '@/domain/work-items/work-item';
import {
  PriorityBadge,
  SlaBadge,
  SourceBadge,
  StatusBadge,
} from '@/presentation/components/work-items/work-item-badges';
import { WorkItemDrawer } from '@/presentation/components/work-items/work-item-drawer';

import classes from './queue-page.module.css';

const sourceOptions = [
  { value: 'all', label: 'Todas as origens' },
  { value: 'jira', label: 'Jira' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'email', label: 'E-mail' },
];

const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  { value: 'new', label: 'Novo' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'waiting', label: 'Aguardando' },
  { value: 'resolved', label: 'Resolvido' },
];

const priorityOptions = [
  { value: 'all', label: 'Todas as prioridades' },
  { value: 'critical', label: 'Crítica' },
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Média' },
  { value: 'low', label: 'Baixa' },
];

const sortOptions = [
  { value: 'urgency', label: 'Urgência' },
  { value: 'sla', label: 'SLA' },
  { value: 'updated', label: 'Última atualização' },
];

export function WorkQueue({
  items,
  onRefresh,
}: {
  items: WorkItem[];
  onRefresh: () => Promise<void>;
}) {
  const [query, setQuery] = useState<WorkQueueQuery>(defaultWorkQueueQuery);
  const [selected, setSelected] = useState<WorkItem>();
  const [opened, { open, close }] = useDisclosure(false);

  const result = useMemo(
    () => filterAndSortWorkItems(items, query),
    [items, query],
  );
  const hasFilters =
    query.search !== '' ||
    query.source !== 'all' ||
    query.status !== 'all' ||
    query.priority !== 'all';

  const update = <Key extends keyof WorkQueueQuery>(
    key: Key,
    value: WorkQueueQuery[Key],
  ) => setQuery((current) => ({ ...current, [key]: value }));

  const inspect = (item: WorkItem) => {
    setSelected(item);
    open();
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={1}>Minha Fila</Title>
          <Text c="dimmed">
            Itens de Jira, Salesforce e E-mail em uma única visão.
          </Text>
        </div>
        <Button
          leftSection={<IconRefresh size={16} />}
          variant="light"
          onClick={() => void onRefresh()}
        >
          Sincronizar
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md">
        <div className={classes.filters}>
          <TextInput
            role="searchbox"
            aria-label="Buscar na fila"
            placeholder="Buscar por item, cliente ou responsável"
            leftSection={<IconSearch size={16} />}
            value={query.search}
            onChange={(event) => update('search', event.currentTarget.value)}
          />
          <Select
            aria-label="Filtrar por origem"
            data={sourceOptions}
            value={query.source}
            onChange={(value) =>
              update('source', (value ?? 'all') as WorkQueueQuery['source'])
            }
          />
          <Select
            aria-label="Filtrar por status"
            data={statusOptions}
            value={query.status}
            onChange={(value) =>
              update('status', (value ?? 'all') as WorkQueueQuery['status'])
            }
          />
          <Select
            aria-label="Filtrar por prioridade"
            data={priorityOptions}
            value={query.priority}
            onChange={(value) =>
              update(
                'priority',
                (value ?? 'all') as WorkQueueQuery['priority'],
              )
            }
          />
          <Select
            aria-label="Ordenar por"
            data={sortOptions}
            value={query.sort}
            onChange={(value) =>
              update('sort', (value ?? 'urgency') as WorkQueueQuery['sort'])
            }
          />
        </div>
      </Paper>

      <Paper withBorder radius="md" className={classes.tablePanel}>
        <Group justify="space-between" p="md">
          <Text fw={700}>
            {result.length} {result.length === 1 ? 'item' : 'itens'}
          </Text>
          {hasFilters ? (
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconFilterOff size={16} />}
              onClick={() => setQuery(defaultWorkQueueQuery)}
            >
              Limpar filtros
            </Button>
          ) : null}
        </Group>

        {result.length === 0 ? (
          <Alert m="md" title="Nenhum item encontrado" color="gray">
            Ajuste os filtros ou limpe a busca para visualizar outros itens.
          </Alert>
        ) : (
          <Table.ScrollContainer minWidth={900}>
            <Table verticalSpacing="md" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Origem</Table.Th>
                  <Table.Th>Item</Table.Th>
                  <Table.Th>Cliente</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Prioridade</Table.Th>
                  <Table.Th>SLA</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {result.map((item) => (
                  <Table.Tr
                    key={item.id}
                    className={classes.row}
                    role="button"
                    tabIndex={0}
                    aria-label={`Abrir detalhes de ${item.externalId}`}
                    onClick={() => inspect(item)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        inspect(item);
                      }
                    }}
                  >
                    <Table.Td>
                      <SourceBadge source={item.source} />
                    </Table.Td>
                    <Table.Td>
                      <Text fw={650}>{item.title}</Text>
                      <Text size="xs" c="dimmed">
                        {item.externalId}
                      </Text>
                    </Table.Td>
                    <Table.Td>{item.customer ?? 'Não informado'}</Table.Td>
                    <Table.Td>
                      <StatusBadge status={item.status} />
                    </Table.Td>
                    <Table.Td>
                      <PriorityBadge priority={item.priority} />
                    </Table.Td>
                    <Table.Td>
                      <SlaBadge dueAt={item.dueAt} />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Paper>

      <WorkItemDrawer item={selected} opened={opened} onClose={close} />
    </Stack>
  );
}
