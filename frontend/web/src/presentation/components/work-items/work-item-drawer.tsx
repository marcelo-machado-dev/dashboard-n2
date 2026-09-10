import {
  Button,
  Divider,
  Drawer,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';

import type { WorkItem } from '@/domain/work-items/work-item';

import { SlaBadge, WorkItemBadgeGroup } from './work-item-badges';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export function WorkItemDrawer({
  item,
  opened,
  onClose,
}: {
  item?: WorkItem;
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title="Detalhes do item"
      transitionProps={{ duration: 0 }}
    >
      {item ? (
        <Stack gap="lg">
          <div>
            <Text size="sm" c="dimmed" fw={600}>
              {item.externalId}
            </Text>
            <Title order={3}>{item.title}</Title>
          </div>

          <WorkItemBadgeGroup
            source={item.source}
            status={item.status}
            priority={item.priority}
          />

          <Text>{item.description}</Text>

          <Divider />

          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="lg">
            <div>
              <Text size="xs" c="dimmed">
                Cliente
              </Text>
              <Text fw={600}>{item.customer ?? 'Não informado'}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                Responsável
              </Text>
              <Text fw={600}>{item.assignee ?? 'Não atribuído'}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                Última atualização
              </Text>
              <Text fw={600}>{formatDate(item.updatedAt)}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                SLA
              </Text>
              <Group mt={4}>
                <SlaBadge dueAt={item.dueAt} />
              </Group>
            </div>
          </SimpleGrid>

          <Button
            component="a"
            href={item.externalUrl}
            target="_blank"
            rel="noreferrer"
            rightSection={<IconExternalLink size={16} />}
          >
            Abrir na ferramenta original
          </Button>
        </Stack>
      ) : null}
    </Drawer>
  );
}
