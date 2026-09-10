import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

import type { WorkItemRepository } from '@/application/work-items/work-item-repository';
import { createMockWorkItems } from '@/infrastructure/work-items/mock-work-items';

import { QueuePage } from './queue-page';

const renderPage = (repository: WorkItemRepository) =>
  render(
    <MantineProvider>
      <QueuePage repository={repository} />
    </MantineProvider>,
  );

it('searches the queue and opens item details', async () => {
  const user = userEvent.setup();

  renderPage({ findAll: async () => createMockWorkItems() });

  const search = await screen.findByRole('searchbox', {
    name: /buscar na fila/i,
  });
  await user.type(search, 'ACME');

  expect(screen.getByText('Acesso bloqueado para cliente')).toBeInTheDocument();
  expect(screen.queryByText('Validar regra de faturamento')).not.toBeInTheDocument();

  fireEvent.click(
    screen.getByRole('button', { name: /abrir detalhes de CASE-1048/i }),
  );

  expect(screen.getByRole('dialog')).toHaveTextContent('ACME Brasil');
});

it('shows an empty state when no item matches', async () => {
  const user = userEvent.setup();

  renderPage({ findAll: async () => createMockWorkItems() });

  await user.type(
    await screen.findByRole('searchbox', { name: /buscar na fila/i }),
    'nenhum-item-existe',
  );

  expect(screen.getByText('Nenhum item encontrado')).toBeInTheDocument();
});

it('reloads the queue when synchronizing', async () => {
  const initialItem = { ...createMockWorkItems()[0], title: 'Caso inicial' };
  const updatedItem = { ...initialItem, title: 'Caso atualizado' };
  const findAll = vi
    .fn()
    .mockResolvedValueOnce([initialItem])
    .mockResolvedValueOnce([updatedItem]);

  renderPage({ findAll });

  expect(await screen.findByText('Caso inicial')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /sincronizar/i }));

  expect(await screen.findByText('Caso atualizado')).toBeInTheDocument();
  expect(findAll).toHaveBeenCalledTimes(2);
});

it('shows an error and retries loading', async () => {
  const findAll = vi
    .fn()
    .mockRejectedValueOnce(new Error('Falha temporária'))
    .mockResolvedValueOnce(createMockWorkItems());

  renderPage({ findAll });

  expect(await screen.findByText('Falha temporária')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));

  await waitFor(() => expect(screen.getByText('Minha Fila')).toBeInTheDocument());
  expect(findAll).toHaveBeenCalledTimes(2);
});
