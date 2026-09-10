import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { FutureSectionPage } from './future-section-page';

it('shows the planned section message and links back to the queue', () => {
  render(
    <MantineProvider>
      <FutureSectionPage
        title="Jira"
        description="A visão dedicada de solicitações e comentários está planejada."
      />
    </MantineProvider>,
  );

  expect(screen.getByRole('heading', { name: 'Jira' })).toBeInTheDocument();
  expect(
    screen.getByText(
      'A visão dedicada de solicitações e comentários está planejada.',
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /voltar para minha fila/i }),
  ).toHaveAttribute('href', '/queue');
});
