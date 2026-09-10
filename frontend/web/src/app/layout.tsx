import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';

import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import type { Metadata } from 'next';

import { ApplicationShell } from '@/presentation/layouts/application-shell';
import { AppProviders } from '@/presentation/providers/app-providers';

export const metadata: Metadata = {
  title: {
    default: 'Central N2',
    template: '%s | Central N2',
  },
  description:
    'Central operacional de pendências do Jira, Salesforce e E-mail.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <AppProviders>
          <ApplicationShell>{children}</ApplicationShell>
        </AppProviders>
      </body>
    </html>
  );
}
