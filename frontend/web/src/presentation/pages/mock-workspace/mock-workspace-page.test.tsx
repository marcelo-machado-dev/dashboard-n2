import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MockWorkspacePage } from './mock-workspace-page';

describe('MockWorkspacePage', () => {
  it('renders an integration workspace with searchable mock records', () => {
    render(
      <MantineProvider>
        <MockWorkspacePage variant="jira" />
      </MantineProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Jira' })).toBeInTheDocument();
    expect(screen.getByText('SP-4821')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar no Jira')).toBeInTheDocument();
  });

  it('renders metrics and settings mock workspaces', () => {
    const { rerender } = render(
      <MantineProvider>
        <MockWorkspacePage variant="metrics" />
      </MantineProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Métricas' })).toBeInTheDocument();
    expect(screen.getByText('SLA dentro do prazo')).toBeInTheDocument();

    rerender(
      <MantineProvider>
        <MockWorkspacePage variant="settings" />
      </MantineProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Configurações' })).toBeInTheDocument();
    expect(screen.getByText('Notificações')).toBeInTheDocument();
  });
});
