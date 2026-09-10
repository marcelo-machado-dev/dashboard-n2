'use client';

import { Alert, Button, Group, Skeleton, Stack, Text } from '@mantine/core';

import type { WorkItemRepository } from '@/application/work-items/work-item-repository';
import { useWorkItems } from '@/presentation/hooks/use-work-items';

import { WorkQueue } from './work-queue';

export function QueuePage({ repository }: { repository: WorkItemRepository }) {
  const { items, status, error, retry } = useWorkItems(repository);

  if (status === 'loading') {
    return (
      <Stack>
        <Skeleton height={72} />
        <Skeleton height={68} />
        <Skeleton height={420} />
      </Stack>
    );
  }

  if (status === 'error') {
    return (
      <Alert color="red" title="Não foi possível carregar a fila">
        <Group justify="space-between" align="center">
          <Text>{error}</Text>
          <Button variant="light" color="red" onClick={() => void retry()}>
            Tentar novamente
          </Button>
        </Group>
      </Alert>
    );
  }

  return <WorkQueue items={items} onRefresh={retry} />;
}
