'use client';

import {
  AppShell,
  Avatar,
  Badge,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconChartBar,
  IconBrandDiscord,
  IconChevronDown,
  IconHome,
  IconInbox,
  IconMail,
  IconSearch,
  IconSettings,
  IconStack2,
  IconTicket,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import classes from './application-shell.module.css';

const links = [
  { href: '/', label: 'Início', icon: IconHome },
  { href: '/queue', label: 'Minha Fila', icon: IconInbox, count: 12 },
  { href: '/jira', label: 'Jira', icon: IconStack2, count: 4 },
  { href: '/salesforce', label: 'Salesforce', icon: IconTicket, count: 5 },
  { href: '/emails', label: 'E-mails', icon: IconMail, count: 3 },
  { href: '/discord', label: 'Discord', icon: IconBrandDiscord, count: 3 },
  { href: '/metrics', label: 'Métricas', icon: IconChartBar },
  { href: '/settings', label: 'Configurações', icon: IconSettings },
];

export function ApplicationShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [opened, { toggle, close }] = useDisclosure();
  const pathname = usePathname();
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'Central N2';

  return (
    <AppShell
      header={{ height: 72 }}
      navbar={{
        width: 252,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding={{ base: 'md', sm: 'xl' }}
    >
      <AppShell.Header className={classes.header}>
        <Group h="100%" px={{ base: 'md', sm: 'lg' }} justify="space-between">
          <Group gap="sm">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              aria-label="Alternar menu principal"
            />
            <div className={classes.brandMark}>N2</div>
            <Text fw={800} size="lg" className={classes.brandName}>
              {appName}
            </Text>
          </Group>

          <TextInput
            visibleFrom="md"
            w={340}
            leftSection={<IconSearch size={17} />}
            placeholder="Buscar em tudo"
            aria-label="Buscar em tudo"
            radius="xl"
          />

          <UnstyledButton className={classes.profileButton}>
            <Group gap="sm" wrap="nowrap">
              <Avatar color="brand" radius="xl">
                MS
              </Avatar>
              <div className={classes.profileCopy}>
                <Text size="sm" fw={700} lh={1.2}>
                  Marcelo Santos
                </Text>
                <Text size="xs" c="dimmed">
                  Colaborador N2
                </Text>
              </div>
              <IconChevronDown size={15} className={classes.profileCopy} />
            </Group>
          </UnstyledButton>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" className={classes.navbar} data-theme="dark">
        <AppShell.Section grow component={ScrollArea}>
          <Text className={classes.sectionLabel}>ESPAÇO DE TRABALHO</Text>
          <Stack gap={5} mt="sm">
            {links.map(({ href, label, icon: Icon, count }) => (
              <NavLink
                key={href}
                component={Link}
                href={href}
                label={label}
                leftSection={
                  <ThemeIcon
                    variant="transparent"
                    color={pathname === href ? 'brand' : 'gray'}
                    size={28}
                    data-sidebar-icon
                    data-tone={pathname === href ? 'light' : 'muted'}
                  >
                    <Icon size={19} stroke={1.8} />
                  </ThemeIcon>
                }
                rightSection={
                  count ? (
                    <Badge
                      size="sm"
                      variant={pathname === href ? 'filled' : 'light'}
                      color={pathname === href ? 'brand' : 'gray'}
                      circle
                    >
                      {count}
                    </Badge>
                  ) : undefined
                }
                active={pathname === href}
                onClick={close}
                className={classes.navLink}
              />
            ))}
          </Stack>
        </AppShell.Section>

        <AppShell.Section className={classes.environmentCard}>
          <Group gap="sm" wrap="nowrap">
            <span className={classes.environmentDot} />
            <div>
              <Text size="xs" fw={700}>
                Ambiente de demonstração
              </Text>
              <Text size="xs" className={classes.environmentMeta}>
                Dados locais mockados
              </Text>
            </div>
          </Group>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
