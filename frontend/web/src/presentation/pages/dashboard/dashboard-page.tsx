'use client';

import {
  Alert,
  Button,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconInbox,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';

import { buildDashboardSummary } from '@/application/work-items/build-dashboard-summary';
import type { WorkItemRepository } from '@/application/work-items/work-item-repository';
import type { WorkItem } from '@/domain/work-items/work-item';
import {
  SlaBadge,
  SourceBadge,
  StatusBadge,
} from '@/presentation/components/work-items/work-item-badges';
import { WorkItemDrawer } from '@/presentation/components/work-items/work-item-drawer';
import { useWorkItems } from '@/presentation/hooks/use-work-items';

import classes from './dashboard-page.module.css';

const metricConfig = [
  { key: 'pending', label: 'Pendentes', color: 'blue', icon: IconInbox },
  { key: 'urgent', label: 'Urgentes', color: 'red', icon: IconAlertTriangle },
  { key: 'approachingSla', label: 'SLA próximo', color: 'orange', icon: IconClock },
  { key: 'completedToday', label: 'Concluídos hoje', color: 'green', icon: IconCheck },
] as const;

const sourceBreakdown = [
  { key: 'jira', label: 'Jira', color: 'indigo' },
  { key: 'salesforce', label: 'Salesforce', color: 'cyan' },
  { key: 'email', label: 'E-mail', color: 'grape' },
] as const;

export function DashboardPage({
  repository,
}: {
  repository: WorkItemRepository;
}) {
  const { items, status, error, retry } = useWorkItems(repository);
  const [selected, setSelected] = useState<WorkItem>();
  const [opened, { open, close }] = useDisclosure(false);

  if (status === 'loading') {
    return (
      <Stack>
        <Skeleton height={72} />
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          {metricConfig.map(({ key }) => (
            <Skeleton key={key} height={118} />
          ))}
        </SimpleGrid>
        <Skeleton height={320} />
      </Stack>
    );
  }

  if (status === 'error') {
    return (
      <Alert color="red" title="Não foi possível carregar o painel">
        <Group justify="space-between" align="center">
          <Text>{error}</Text>
          <Button variant="light" color="red" onClick={() => void retry()}>
            Tentar novamente
          </Button>
        </Group>
      </Alert>
    );
  }

  const summary = buildDashboardSummary(items);
  const today = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
  }).format(new Date());
  const totalItems = Math.max(items.length, 1);

  const inspect = (item: WorkItem) => {
    setSelected(item);
    open();
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <div>
          <Text c="dimmed" size="sm">
            {today}
          </Text>
          <Title order={1}>Bom dia, Marcelo</Title>
          <Text c="dimmed">Aqui está o que precisa da sua atenção agora.</Text>
        </div>
        <Button component={Link} href="/queue">
          Ver fila completa
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {metricConfig.map(({ key, label, color, icon: Icon }) => (
          <Paper key={key} withBorder p="lg" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">
                  {label}
                </Text>
                <Text fz={30} fw={800}>
                  {summary.metrics[key]}
                </Text>
              </div>
              <ThemeIcon color={color} variant="light" size={44} radius="md">
                <Icon size={22} />
              </ThemeIcon>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="xl">
        <Paper withBorder p="lg" radius="md" className={classes.queuePanel}>
          <Group justify="space-between" mb="md">
            <div>
              <Title order={3}>Sua fila agora</Title>
              <Text size="sm" c="dimmed">
                Ordenada pelo que requer ação primeiro
              </Text>
            </div>
            <Button component={Link} href="/queue" variant="subtle">
              Ver todos
            </Button>
          </Group>

          <Stack gap="xs">
            {summary.topItems.map((item) => (
              <button
                className={classes.itemButton}
                key={item.id}
                onClick={() => inspect(item)}
                aria-label={`Abrir detalhes de ${item.externalId}`}
              >
                <div className={classes.itemMeta}>
                  <Group gap="xs">
                    <SourceBadge source={item.source} />
                    <Text size="xs" c="dimmed">
                      {item.externalId}
                    </Text>
                  </Group>
                  <Text fw={650} mt={6}>
                    {item.title}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {item.customer}
                  </Text>
                </div>
                <Stack gap={6} align="flex-end" className={classes.itemActions}>
                  <StatusBadge status={item.status} />
                  <SlaBadge dueAt={item.dueAt} />
                </Stack>
              </button>
            ))}
          </Stack>
        </Paper>

        <Paper withBorder p="lg" radius="md">
          <Title order={3}>Itens por origem</Title>
          <Text size="sm" c="dimmed" mb="xl">
            Distribuição da sua fila atual
          </Text>

          <Stack gap="lg">
            {sourceBreakdown.map(({ key, label, color }) => {
              const value = summary.bySource[key];

              return (
                <div key={key}>
                  <Group justify="space-between">
                    <Text fw={600}>{label}</Text>
                    <Text fw={700}>{value}</Text>
                  </Group>
                  <Progress value={(value / totalItems) * 100} color={color} mt={6} />
                </div>
              );
            })}
          </Stack>
        </Paper>
      </SimpleGrid>

      <WorkItemDrawer item={selected} opened={opened} onClose={close} />
    </Stack>
  );
}
