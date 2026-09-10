'use client';

import {
  Badge,
  Button,
  Group,
  Paper,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconAdjustments,
  IconChartBar,
  IconExternalLink,
  IconMail,
  IconRefresh,
  IconSearch,
  IconSettings,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';

type Variant = 'jira' | 'salesforce' | 'emails' | 'discord' | 'metrics' | 'settings';

type RecordItem = {
  id: string;
  title: string;
  secondary: string;
  status: string;
  statusColor: string;
  priority: string;
  priorityColor: string;
  age: string;
};

const records: Record<Exclude<Variant, 'metrics' | 'settings'>, RecordItem[]> = {
  jira: [
    { id: 'SP-4821', title: 'Aprovar acesso ao ambiente de produção', secondary: 'Plataforma • Marcelo Santos', status: 'Em andamento', statusColor: 'violet', priority: 'Alta', priorityColor: 'orange', age: 'há 18 min' },
    { id: 'SP-4817', title: 'Corrigir regra de roteamento do cliente ACME', secondary: 'Core • Ana Costa', status: 'Novo', statusColor: 'blue', priority: 'Urgente', priorityColor: 'red', age: 'há 42 min' },
    { id: 'SP-4798', title: 'Atualizar documentação do webhook', secondary: 'Integrações • Rafael Lima', status: 'Aguardando', statusColor: 'yellow', priority: 'Média', priorityColor: 'gray', age: 'ontem' },
  ],
  salesforce: [
    { id: 'CS-90412', title: 'Erro na emissão da fatura mensal', secondary: 'Acme Corp • Conta Enterprise', status: 'Em atendimento', statusColor: 'violet', priority: 'Urgente', priorityColor: 'red', age: 'SLA em 32 min' },
    { id: 'CS-90388', title: 'Dúvida sobre permissões de usuário', secondary: 'Beta Tecnologia • Conta Pro', status: 'Novo', statusColor: 'blue', priority: 'Alta', priorityColor: 'orange', age: 'SLA em 2h' },
    { id: 'CS-90271', title: 'Solicitação de relatório personalizado', secondary: 'Nexus Labs • Conta Business', status: 'Aguardando cliente', statusColor: 'yellow', priority: 'Baixa', priorityColor: 'gray', age: 'há 1 dia' },
  ],
  emails: [
    { id: 'EM-2187', title: 'Re: Incidente de integração — atualização', secondary: 'carolina@acme.com • 4 mensagens', status: 'Responder', statusColor: 'red', priority: 'Urgente', priorityColor: 'red', age: 'há 8 min' },
    { id: 'EM-2181', title: 'Acesso ao relatório de uso', secondary: 'joao@betatech.com • 1 mensagem', status: 'Não lido', statusColor: 'blue', priority: 'Média', priorityColor: 'gray', age: 'há 1h' },
    { id: 'EM-2172', title: 'Confirmação da janela de manutenção', secondary: 'ops@nexuslabs.io • 6 mensagens', status: 'Aguardando', statusColor: 'yellow', priority: 'Baixa', priorityColor: 'gray', age: 'ontem' },
  ],
  discord: [
    { id: 'DIS-1182', title: 'Como faço para resetar minha senha?', secondary: '#suporte • @lucas.m • há 12 min', status: 'Sem resposta', statusColor: 'red', priority: 'Urgente', priorityColor: 'red', age: 'há 12 min' },
    { id: 'DIS-1176', title: 'O webhook está retornando erro 401', secondary: '#integracoes • @carol_dev • há 38 min', status: 'Sem resposta', statusColor: 'orange', priority: 'Alta', priorityColor: 'orange', age: 'há 38 min' },
    { id: 'DIS-1169', title: 'Podem compartilhar o horário da manutenção?', secondary: '#avisos • @andre.s • ontem', status: 'Sem resposta', statusColor: 'yellow', priority: 'Média', priorityColor: 'gray', age: 'ontem' },
  ],
};

const pageCopy: Record<Exclude<Variant, 'metrics' | 'settings'>, { title: string; description: string; placeholder: string }> = {
  jira: { title: 'Jira', description: 'Solicitações e histórias que precisam da sua atenção.', placeholder: 'Buscar no Jira' },
  salesforce: { title: 'Salesforce', description: 'Casos de clientes acompanhados pela sua equipe.', placeholder: 'Buscar no Salesforce' },
  emails: { title: 'E-mails', description: 'Conversas recentes que aguardam uma resposta.', placeholder: 'Buscar nos e-mails' },
  discord: { title: 'Discord', description: 'Mensagens lidas que ainda precisam de uma resposta.', placeholder: 'Buscar nas mensagens do Discord' },
};

export function MockWorkspacePage({ variant }: { variant: Variant }) {
  if (variant === 'metrics') return <MetricsWorkspace />;
  if (variant === 'settings') return <SettingsWorkspace />;

  return <IntegrationWorkspace variant={variant} />;
}

function IntegrationWorkspace({ variant }: { variant: Exclude<Variant, 'metrics' | 'settings'> }) {
  const copy = pageCopy[variant];
  const [query, setQuery] = useState('');
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const filtered = useMemo(
    () => records[variant].filter((item) => !resolvedIds.includes(item.id)).filter((item) => `${item.id} ${item.title} ${item.secondary}`.toLowerCase().includes(query.toLowerCase())),
    [query, resolvedIds, variant],
  );

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <div><Text c="dimmed" size="sm">VISÃO MOCKADA</Text><Title order={1}>{copy.title}</Title><Text c="dimmed">{copy.description}</Text></div>
        <Button leftSection={<IconRefresh size={16} />} variant="light">Sincronizar</Button>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <SummaryCard label="Pendentes" value={String(records[variant].length)} color="blue" />
        <SummaryCard label="Prioridade alta" value="2" color="orange" />
        <SummaryCard label="Atualizados hoje" value="8" color="green" />
      </SimpleGrid>
      <Paper withBorder radius="md" p="lg">
        <Group justify="space-between" mb="md"><Text fw={700}>{variant === 'discord' ? 'Mensagens sem resposta' : 'Itens recentes'}</Text><Text size="sm" c="dimmed">{filtered.length} resultados</Text></Group>
        <Group mb="lg" align="flex-end">
          <TextInput flex={1} leftSection={<IconSearch size={16} />} placeholder={copy.placeholder} value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
          <Select w={170} leftSection={<IconAdjustments size={16} />} data={['Todos', 'Urgente', 'Alta', 'Aguardando']} defaultValue="Todos" />
        </Group>
        <Table.ScrollContainer minWidth={720}><Table verticalSpacing="md" highlightOnHover><Table.Thead><Table.Tr><Table.Th>ID</Table.Th><Table.Th>{variant === 'discord' ? 'Mensagem' : 'Item'}</Table.Th><Table.Th>Status</Table.Th><Table.Th>Prioridade</Table.Th><Table.Th>Atualização</Table.Th><Table.Th /></Table.Tr></Table.Thead><Table.Tbody>{filtered.map((item) => <Table.Tr key={item.id}><Table.Td><Text size="sm" fw={700}>{item.id}</Text></Table.Td><Table.Td><Text fw={600}>{item.title}</Text><Text size="xs" c="dimmed">{item.secondary}</Text></Table.Td><Table.Td><Badge color={item.statusColor} variant="light">{item.status}</Badge></Table.Td><Table.Td><Badge color={item.priorityColor} variant="light">{item.priority}</Badge></Table.Td><Table.Td><Text size="sm" c="dimmed">{item.age}</Text></Table.Td><Table.Td><Group gap="xs" wrap="nowrap"><Button size="compact-sm" variant="subtle" rightSection={<IconExternalLink size={14} />}>{variant === 'discord' ? 'Responder' : 'Abrir'}</Button>{variant === 'discord' && <Button size="compact-sm" variant="light" color="green" onClick={() => setResolvedIds((ids) => [...ids, item.id])}>Resolver</Button>}</Group></Table.Td></Table.Tr>)}</Table.Tbody></Table></Table.ScrollContainer>
        {filtered.length === 0 && <Text ta="center" c="dimmed" py="xl">Nenhum item encontrado.</Text>}
      </Paper>
    </Stack>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return <Paper withBorder p="lg" radius="md"><Text size="sm" c="dimmed">{label}</Text><Text fz={30} fw={800} c={color}>{value}</Text></Paper>;
}

function MetricsWorkspace() {
  return <Stack gap="xl"><div><Text c="dimmed" size="sm">VISÃO MOCKADA</Text><Title order={1}>Métricas</Title><Text c="dimmed">Indicadores para orientar as decisões da operação.</Text></div><SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}><SummaryCard label="Itens concluídos" value="42" color="green" /><SummaryCard label="Tempo médio" value="3h 18m" color="blue" /><SummaryCard label="SLA dentro do prazo" value="94%" color="teal" /><SummaryCard label="Reaberturas" value="6" color="orange" /></SimpleGrid><Paper withBorder p="lg" radius="md"><Group justify="space-between" mb="xl"><div><Title order={3}>Saúde do SLA</Title><Text size="sm" c="dimmed">Distribuição dos itens encerrados nos últimos 7 dias</Text></div><IconChartBar size={24} /></Group><Stack gap="lg">{[['Segunda', 92], ['Terça', 96], ['Quarta', 88], ['Quinta', 94], ['Sexta', 97]].map(([label, value]) => <div key={String(label)}><Group justify="space-between"><Text fw={600}>{label}</Text><Text fw={700}>{value}%</Text></Group><Progress value={Number(value)} color={Number(value) < 90 ? 'orange' : 'brand'} mt={6} /></div>)}</Stack></Paper></Stack>;
}

function SettingsWorkspace() {
  return <Stack gap="xl"><div><Text c="dimmed" size="sm">VISÃO MOCKADA</Text><Title order={1}>Configurações</Title><Text c="dimmed">Ajuste suas preferências para trabalhar com mais foco.</Text></div><SimpleGrid cols={{ base: 1, md: 2 }}><Paper withBorder p="lg" radius="md"><Group mb="lg"><IconSettings size={22} /><div><Title order={3}>Perfil</Title><Text size="sm" c="dimmed">Dados exibidos no workspace</Text></div></Group><Stack><TextInput label="Nome" defaultValue="Marcelo Santos" /><TextInput label="Cargo" defaultValue="Colaborador N2" /><Button>Salvar alterações</Button></Stack></Paper><Paper withBorder p="lg" radius="md"><Group mb="lg"><IconMail size={22} /><div><Title order={3}>Notificações</Title><Text size="sm" c="dimmed">Escolha o que merece um alerta</Text></div></Group><Stack><Switch label="SLA próximo do vencimento" defaultChecked /><Switch label="Novo item na minha fila" defaultChecked /><Switch label="Resumo diário por e-mail" /></Stack></Paper></SimpleGrid><Paper withBorder p="lg" radius="md"><Title order={3}>Integrações conectadas</Title><Text size="sm" c="dimmed" mb="lg">Conexões demonstrativas — serão configuradas pelo Gateway.</Text><Group><Badge size="lg" color="indigo" variant="light">Jira conectado</Badge><Badge size="lg" color="cyan" variant="light">Salesforce conectado</Badge><Badge size="lg" color="grape" variant="light">E-mail conectado</Badge></Group></Paper></Stack>;
}
