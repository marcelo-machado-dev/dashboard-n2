'use client';

import {
  Button,
  Center,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconClockHour4 } from '@tabler/icons-react';
import Link from 'next/link';

export function FutureSectionPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Center mih="65vh">
      <Paper withBorder radius="md" p="xl" maw={520} w="100%">
        <Stack align="center" ta="center">
          <ThemeIcon size={56} radius="xl" variant="light">
            <IconClockHour4 size={28} />
          </ThemeIcon>
          <Title order={2}>{title}</Title>
          <Text c="dimmed">{description}</Text>
          <Text size="sm" c="dimmed">
            Esta área será adicionada em uma próxima etapa. Sua fila unificada
            já representa os itens dessa origem.
          </Text>
          <Button component={Link} href="/queue" mt="md">
            Voltar para Minha Fila
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}
