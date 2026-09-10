import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import type { WorkItemRepository } from '@/application/work-items/work-item-repository';
import { createMockWorkItems } from '@/infrastructure/work-items/mock-work-items';

import { DashboardPage } from './dashboard-page';

const repository: WorkItemRepository = {
  findAll: async () => createMockWorkItems(),
};

it('shows operational metrics and opens an item detail', async () => {
  render(
    <MantineProvider>
      <DashboardPage repository={repository} />
    </MantineProvider>,
  );

  expect(await screen.findByText('Sua fila agora')).toBeInTheDocument();
  expect(screen.getByText('Pendentes')).toBeInTheDocument();
  expect(screen.getAllByText('Salesforce').length).toBeGreaterThan(0);

  fireEvent.click(
    screen.getByRole('button', { name: /abrir detalhes de CASE-1048/i }),
  );

  expect(screen.getByRole('dialog')).toHaveTextContent(
    'Acesso bloqueado para cliente',
  );
  expect(
    screen.getByRole('link', { name: /abrir na ferramenta original/i }),
  ).toHaveAttribute(
    'href',
    'https://example.com/salesforce/CASE-1048',
  );
});
