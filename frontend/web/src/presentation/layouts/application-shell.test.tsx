import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { ApplicationShell } from './application-shell';

vi.mock('next/navigation', () => ({
  usePathname: () => '/queue',
}));

it('renders the primary navigation around page content', () => {
  render(
    <MantineProvider>
      <ApplicationShell>
        <h1>Conteúdo da página</h1>
      </ApplicationShell>
    </MantineProvider>,
  );

  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect(screen.getByRole('navigation')).toHaveAttribute('data-theme', 'dark');
  expect(screen.getByRole('link', { name: /início/i })).toHaveAttribute(
    'href',
    '/',
  );
  expect(screen.getByRole('link', { name: /minha fila/i })).toHaveAttribute(
    'href',
    '/queue',
  );
  expect(
    screen.getByRole('heading', { name: 'Conteúdo da página' }),
  ).toBeInTheDocument();
});
