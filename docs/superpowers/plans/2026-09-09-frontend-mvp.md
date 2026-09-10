# Frontend MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Docker-ready Next.js frontend that presents an operational dashboard and a filterable unified work queue backed by realistic mock data.

**Architecture:** Use pragmatic Clean Architecture boundaries inside `frontend/web`: pure work-item types and SLA rules in domain, filtering and summary use cases in application, a mock repository in infrastructure, and Mantine/React UI in presentation. Thin App Router files act as composition roots and inject the mock repository into client-side presentation screens.

**Tech Stack:** Next.js 16.3, React 19, TypeScript, Mantine 9.6, Tabler Icons, Vitest 5, React Testing Library, CSS Modules, Node.js 22 Alpine, Docker Compose.

---

## File Map

### Project and tooling

- Create: `.gitignore` — excludes visual brainstorming state and local environment files.
- Create: `frontend/web/package.json` and `frontend/web/package-lock.json` — scripts and locked dependencies.
- Create: `frontend/web/tsconfig.json` — strict TypeScript and `@/*` alias.
- Create: `frontend/web/next.config.ts` — standalone production output.
- Create: `frontend/web/eslint.config.mjs` — Next.js ESLint rules.
- Create: `frontend/web/postcss.config.cjs` — Mantine PostCSS setup.
- Create: `frontend/web/vitest.config.ts` — jsdom test environment and alias.
- Create: `frontend/web/src/test/setup.ts` — DOM matchers and browser API shims.
- Create: `frontend/web/.env.example` — safe public frontend configuration example.

### Domain and application

- Create: `frontend/web/src/domain/work-items/work-item.ts` — internal work-item model and enums.
- Create: `frontend/web/src/domain/work-items/sla.ts` — pure SLA classification and duration helpers.
- Test: `frontend/web/src/domain/work-items/sla.test.ts`.
- Create: `frontend/web/src/application/work-items/work-item-repository.ts` — repository port.
- Create: `frontend/web/src/application/work-items/work-queue-query.ts` — queue query types and defaults.
- Create: `frontend/web/src/application/work-items/filter-and-sort-work-items.ts` — pure queue transformation.
- Test: `frontend/web/src/application/work-items/filter-and-sort-work-items.test.ts`.
- Create: `frontend/web/src/application/work-items/build-dashboard-summary.ts` — dashboard metrics and priority slice.
- Test: `frontend/web/src/application/work-items/build-dashboard-summary.test.ts`.

### Infrastructure

- Create: `frontend/web/src/infrastructure/work-items/mock-work-items.ts` — deterministic realistic fixture factory.
- Create: `frontend/web/src/infrastructure/work-items/mock-work-item-repository.ts` — asynchronous mock repository.
- Test: `frontend/web/src/infrastructure/work-items/mock-work-item-repository.test.ts`.

### Presentation and routes

- Create: `frontend/web/src/presentation/providers/app-providers.tsx` — Mantine and Notifications providers.
- Create: `frontend/web/src/presentation/theme/theme.ts` — approved light visual system.
- Create: `frontend/web/src/presentation/layouts/application-shell.tsx` — responsive AppShell.
- Create: `frontend/web/src/presentation/layouts/application-shell.module.css`.
- Create: `frontend/web/src/presentation/hooks/use-work-items.ts` — repository loading/retry state.
- Test: `frontend/web/src/presentation/hooks/use-work-items.test.tsx`.
- Create: `frontend/web/src/presentation/components/work-items/work-item-badges.tsx` — source, status, priority, and SLA badges.
- Create: `frontend/web/src/presentation/components/work-items/work-item-drawer.tsx` — item detail drawer.
- Create: `frontend/web/src/presentation/pages/dashboard/dashboard-page.tsx` and CSS module.
- Test: `frontend/web/src/presentation/pages/dashboard/dashboard-page.test.tsx`.
- Create: `frontend/web/src/presentation/pages/queue/work-queue.tsx`, `queue-page.tsx`, and CSS module.
- Test: `frontend/web/src/presentation/pages/queue/queue-page.test.tsx`.
- Create: `frontend/web/src/presentation/pages/future-section/future-section-page.tsx`.
- Create: `frontend/web/src/app/layout.tsx`, `globals.css`, and route files for all approved routes.

### Containers and documentation

- Create: `frontend/web/Dockerfile` — development and production stages.
- Create: `frontend/web/.dockerignore`.
- Create: `docker-compose.yml` — frontend-only development service.
- Create: `README.md` — local and Docker commands.

## Task 1: Scaffold the Next.js and Mantine Application

**Files:**
- Create: `.gitignore`
- Create: `frontend/web/package.json`
- Create: `frontend/web/package-lock.json`
- Create: `frontend/web/tsconfig.json`
- Create: `frontend/web/next.config.ts`
- Create: `frontend/web/eslint.config.mjs`
- Create: `frontend/web/postcss.config.cjs`
- Create: `frontend/web/vitest.config.ts`
- Create: `frontend/web/src/test/setup.ts`
- Create: `frontend/web/.env.example`

- [ ] **Step 1: Generate the application without Tailwind**

Run from the repository root:

```bash
npx create-next-app@16.3.4 frontend/web --typescript --eslint --app --src-dir --import-alias "@/*" --use-npm --no-tailwind --yes
```

Expected: `frontend/web` is generated with App Router and `npm install` completes.

- [ ] **Step 2: Install only the approved UI and test dependencies**

Run:

```bash
cd frontend/web
npm install @mantine/core@9.6.1 @mantine/hooks@9.6.1 @mantine/notifications@9.6.1 @tabler/icons-react@3.46.0
npm install --save-dev postcss@8.5.28 postcss-preset-mantine@1.18.0 postcss-simple-vars@7.0.1 vitest@5.0.0 @vitejs/plugin-react@6.1.1 jsdom@30.0.1 @testing-library/react@16.3.3 @testing-library/jest-dom@7.0.1 @testing-library/user-event@14.6.7
```

Expected: `package.json` and `package-lock.json` contain the dependencies with no peer-dependency error.

- [ ] **Step 3: Add deterministic quality scripts**

Set the `scripts` object in `frontend/web/package.json` to:

```json
{
  "dev": "next dev --hostname 0.0.0.0",
  "build": "next build",
  "start": "next start --hostname 0.0.0.0",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 4: Configure Mantine PostCSS and standalone Next.js output**

Create `frontend/web/postcss.config.cjs`:

```js
module.exports = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-xs': '36em',
        'mantine-breakpoint-sm': '48em',
        'mantine-breakpoint-md': '62em',
        'mantine-breakpoint-lg': '75em',
        'mantine-breakpoint-xl': '88em',
      },
    },
  },
};
```

Create `frontend/web/next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

- [ ] **Step 5: Configure Vitest and browser shims**

Create `frontend/web/vitest.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
});
```

Create `frontend/web/src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
```

- [ ] **Step 6: Add safe root and environment ignores**

Create `.gitignore`:

```gitignore
.superpowers/
.env
.env.*
!.env.example
node_modules/
.next/
coverage/
*.log
```

Create `frontend/web/.env.example`:

```dotenv
NEXT_PUBLIC_APP_NAME=Central N2
```

- [ ] **Step 7: Verify the empty scaffold**

Run:

```bash
cd frontend/web
npm run lint
npm run typecheck
npm run build
```

Expected: all three commands exit with code 0.

- [ ] **Step 8: Commit the scaffold**

```bash
git add .gitignore frontend/web
git commit -m "chore: scaffold frontend application"
```

## Task 2: Define Work Item Domain Rules

**Files:**
- Create: `frontend/web/src/domain/work-items/work-item.ts`
- Create: `frontend/web/src/domain/work-items/sla.ts`
- Test: `frontend/web/src/domain/work-items/sla.test.ts`

- [ ] **Step 1: Write failing SLA tests**

Create `frontend/web/src/domain/work-items/sla.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { classifySla, formatDuration } from './sla';

const now = new Date('2026-09-09T12:00:00.000Z');

describe('classifySla', () => {
  it.each([
    [undefined, 'unavailable'],
    ['2026-09-09T11:59:00.000Z', 'critical'],
    ['2026-09-09T12:29:00.000Z', 'critical'],
    ['2026-09-09T15:00:00.000Z', 'approaching'],
    ['2026-09-10T12:01:00.000Z', 'healthy'],
  ] as const)('classifies %s as %s', (dueAt, expected) => {
    expect(classifySla(dueAt, now)).toBe(expected);
  });
});

describe('formatDuration', () => {
  it('formats overdue, minutes, hours, and days', () => {
    expect(formatDuration(-60_000)).toBe('Vencido');
    expect(formatDuration(28 * 60_000)).toBe('28 min');
    expect(formatDuration(3.5 * 3_600_000)).toBe('3h 30min');
    expect(formatDuration(27 * 3_600_000)).toBe('1d 3h');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
cd frontend/web
npm test -- src/domain/work-items/sla.test.ts
```

Expected: FAIL because `./sla` does not exist.

- [ ] **Step 3: Add the internal domain model**

Create `frontend/web/src/domain/work-items/work-item.ts`:

```ts
export type WorkItemSource = 'jira' | 'salesforce' | 'email';
export type WorkItemStatus = 'new' | 'in_progress' | 'waiting' | 'resolved';
export type WorkItemPriority = 'critical' | 'high' | 'medium' | 'low';

export type WorkItem = {
  id: string;
  externalId: string;
  source: WorkItemSource;
  title: string;
  description: string;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  assignee?: string;
  customer?: string;
  createdAt: string;
  updatedAt: string;
  dueAt?: string;
  externalUrl: string;
};
```

- [ ] **Step 4: Implement the pure SLA rules**

Create `frontend/web/src/domain/work-items/sla.ts`:

```ts
export type SlaState = 'critical' | 'approaching' | 'healthy' | 'unavailable';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export function getRemainingSlaMs(dueAt: string | undefined, now = new Date()) {
  return dueAt ? new Date(dueAt).getTime() - now.getTime() : undefined;
}

export function classifySla(dueAt: string | undefined, now = new Date()): SlaState {
  const remaining = getRemainingSlaMs(dueAt, now);
  if (remaining === undefined) return 'unavailable';
  if (remaining <= HOUR) return 'critical';
  if (remaining <= 8 * HOUR) return 'approaching';
  return 'healthy';
}

export function formatDuration(milliseconds: number) {
  if (milliseconds <= 0) return 'Vencido';
  if (milliseconds < HOUR) return `${Math.ceil(milliseconds / 60_000)} min`;
  if (milliseconds < DAY) {
    const hours = Math.floor(milliseconds / HOUR);
    const minutes = Math.floor((milliseconds % HOUR) / 60_000);
    return minutes ? `${hours}h ${minutes}min` : `${hours}h`;
  }
  const days = Math.floor(milliseconds / DAY);
  const hours = Math.floor((milliseconds % DAY) / HOUR);
  return hours ? `${days}d ${hours}h` : `${days}d`;
}
```

- [ ] **Step 5: Run the domain tests**

Run:

```bash
cd frontend/web
npm test -- src/domain/work-items/sla.test.ts
```

Expected: 6 tests pass.

- [ ] **Step 6: Commit the domain model**

```bash
git add frontend/web/src/domain
git commit -m "feat: add work item domain model"
```

## Task 3: Implement Queue Filtering and Sorting

**Files:**
- Create: `frontend/web/src/application/work-items/work-item-repository.ts`
- Create: `frontend/web/src/application/work-items/work-queue-query.ts`
- Create: `frontend/web/src/application/work-items/filter-and-sort-work-items.ts`
- Test: `frontend/web/src/application/work-items/filter-and-sort-work-items.test.ts`

- [ ] **Step 1: Write a focused failing use-case test**

Create `frontend/web/src/application/work-items/filter-and-sort-work-items.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { WorkItem } from '@/domain/work-items/work-item';
import { filterAndSortWorkItems } from './filter-and-sort-work-items';
import { defaultWorkQueueQuery } from './work-queue-query';

const items: WorkItem[] = [
  { id: '1', externalId: 'SP-10', source: 'jira', title: 'Validar acesso', description: '', status: 'in_progress', priority: 'high', customer: 'Orbe', assignee: 'Ana', createdAt: '2026-09-08T10:00:00Z', updatedAt: '2026-09-09T10:00:00Z', dueAt: '2026-09-09T13:00:00Z', externalUrl: 'https://example.com/jira/SP-10' },
  { id: '2', externalId: 'CASE-20', source: 'salesforce', title: 'Falha no faturamento', description: '', status: 'new', priority: 'critical', customer: 'ACME', assignee: 'Marcelo', createdAt: '2026-09-08T09:00:00Z', updatedAt: '2026-09-09T11:00:00Z', dueAt: '2026-09-09T12:30:00Z', externalUrl: 'https://example.com/salesforce/CASE-20' },
  { id: '3', externalId: 'MAIL-30', source: 'email', title: 'Enviar evidências', description: '', status: 'waiting', priority: 'medium', customer: 'Nimbus', assignee: 'Marcelo', createdAt: '2026-09-07T09:00:00Z', updatedAt: '2026-09-08T08:00:00Z', externalUrl: 'https://example.com/email/MAIL-30' },
];

describe('filterAndSortWorkItems', () => {
  it('searches across relevant fields without case sensitivity', () => {
    const result = filterAndSortWorkItems(items, { ...defaultWorkQueueQuery, search: 'acme' });
    expect(result.map((item) => item.id)).toEqual(['2']);
  });

  it('combines source, status, and priority filters', () => {
    const result = filterAndSortWorkItems(items, { source: 'jira', status: 'in_progress', priority: 'high', search: '', sort: 'urgency' });
    expect(result.map((item) => item.id)).toEqual(['1']);
  });

  it('sorts by urgency, SLA, and latest update', () => {
    expect(filterAndSortWorkItems(items, defaultWorkQueueQuery).map((item) => item.id)).toEqual(['2', '1', '3']);
    expect(filterAndSortWorkItems(items, { ...defaultWorkQueueQuery, sort: 'sla' }).map((item) => item.id)).toEqual(['2', '1', '3']);
    expect(filterAndSortWorkItems(items, { ...defaultWorkQueueQuery, sort: 'updated' }).map((item) => item.id)).toEqual(['2', '1', '3']);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
cd frontend/web
npm test -- src/application/work-items/filter-and-sort-work-items.test.ts
```

Expected: FAIL because application modules do not exist.

- [ ] **Step 3: Define the repository port and query contract**

Create `frontend/web/src/application/work-items/work-item-repository.ts`:

```ts
import type { WorkItem } from '@/domain/work-items/work-item';

export interface WorkItemRepository {
  findAll(): Promise<WorkItem[]>;
}
```

Create `frontend/web/src/application/work-items/work-queue-query.ts`:

```ts
import type { WorkItemPriority, WorkItemSource, WorkItemStatus } from '@/domain/work-items/work-item';

export type WorkQueueSort = 'urgency' | 'sla' | 'updated';

export type WorkQueueQuery = {
  search: string;
  source: WorkItemSource | 'all';
  status: WorkItemStatus | 'all';
  priority: WorkItemPriority | 'all';
  sort: WorkQueueSort;
};

export const defaultWorkQueueQuery: WorkQueueQuery = {
  search: '',
  source: 'all',
  status: 'all',
  priority: 'all',
  sort: 'urgency',
};
```

- [ ] **Step 4: Implement the filter and stable sort**

Create `frontend/web/src/application/work-items/filter-and-sort-work-items.ts`:

```ts
import type { WorkItem, WorkItemPriority } from '@/domain/work-items/work-item';
import type { WorkQueueQuery } from './work-queue-query';

const priorityRank: Record<WorkItemPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

function includesSearch(item: WorkItem, search: string) {
  const term = search.trim().toLocaleLowerCase('pt-BR');
  if (!term) return true;
  return [item.externalId, item.title, item.customer, item.assignee]
    .filter(Boolean)
    .some((value) => value!.toLocaleLowerCase('pt-BR').includes(term));
}

export function filterAndSortWorkItems(items: WorkItem[], query: WorkQueueQuery) {
  return items
    .filter((item) => includesSearch(item, query.search))
    .filter((item) => query.source === 'all' || item.source === query.source)
    .filter((item) => query.status === 'all' || item.status === query.status)
    .filter((item) => query.priority === 'all' || item.priority === query.priority)
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      if (query.sort === 'updated') {
        return new Date(right.item.updatedAt).getTime() - new Date(left.item.updatedAt).getTime() || left.index - right.index;
      }
      if (query.sort === 'sla') {
        return (left.item.dueAt ? new Date(left.item.dueAt).getTime() : Number.POSITIVE_INFINITY)
          - (right.item.dueAt ? new Date(right.item.dueAt).getTime() : Number.POSITIVE_INFINITY)
          || left.index - right.index;
      }
      return priorityRank[left.item.priority] - priorityRank[right.item.priority]
        || (left.item.dueAt ? new Date(left.item.dueAt).getTime() : Number.POSITIVE_INFINITY)
          - (right.item.dueAt ? new Date(right.item.dueAt).getTime() : Number.POSITIVE_INFINITY)
        || left.index - right.index;
    })
    .map(({ item }) => item);
}
```

- [ ] **Step 5: Run the application tests**

Run:

```bash
cd frontend/web
npm test -- src/application/work-items/filter-and-sort-work-items.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 6: Commit the queue use case**

```bash
git add frontend/web/src/application/work-items
git commit -m "feat: add work queue filtering"
```

## Task 4: Build Dashboard Summary Rules

**Files:**
- Create: `frontend/web/src/application/work-items/build-dashboard-summary.ts`
- Test: `frontend/web/src/application/work-items/build-dashboard-summary.test.ts`

- [ ] **Step 1: Write the failing dashboard summary test**

Create `frontend/web/src/application/work-items/build-dashboard-summary.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { WorkItem } from '@/domain/work-items/work-item';
import { buildDashboardSummary } from './build-dashboard-summary';

const base: WorkItem = { id: 'base', externalId: 'BASE', source: 'jira', title: 'Base', description: '', status: 'new', priority: 'medium', createdAt: '2026-09-08T09:00:00Z', updatedAt: '2026-09-09T09:00:00Z', externalUrl: 'https://example.com' };
const items: WorkItem[] = [
  { ...base, id: '1', priority: 'critical', dueAt: '2026-09-09T12:30:00Z' },
  { ...base, id: '2', source: 'salesforce', priority: 'high', dueAt: '2026-09-09T15:00:00Z' },
  { ...base, id: '3', source: 'email', status: 'resolved', updatedAt: '2026-09-09T08:00:00Z' },
  { ...base, id: '4', status: 'resolved', updatedAt: '2026-09-08T23:59:00Z' },
];

it('returns actionable counts, source totals, and the top queue', () => {
  const summary = buildDashboardSummary(items, new Date('2026-09-09T12:00:00Z'));
  expect(summary.metrics).toEqual({ pending: 2, urgent: 1, approachingSla: 1, completedToday: 1 });
  expect(summary.bySource).toEqual({ jira: 2, salesforce: 1, email: 1 });
  expect(summary.topItems.map((item) => item.id)).toEqual(['1', '2']);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
cd frontend/web
npm test -- src/application/work-items/build-dashboard-summary.test.ts
```

Expected: FAIL because `build-dashboard-summary.ts` does not exist.

- [ ] **Step 3: Implement dashboard aggregation**

Create `frontend/web/src/application/work-items/build-dashboard-summary.ts`:

```ts
import type { WorkItem, WorkItemSource } from '@/domain/work-items/work-item';
import { classifySla } from '@/domain/work-items/sla';
import { filterAndSortWorkItems } from './filter-and-sort-work-items';
import { defaultWorkQueueQuery } from './work-queue-query';

export function buildDashboardSummary(items: WorkItem[], now = new Date()) {
  const active = items.filter((item) => item.status !== 'resolved');
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const bySource: Record<WorkItemSource, number> = { jira: 0, salesforce: 0, email: 0 };
  items.forEach((item) => { bySource[item.source] += 1; });

  return {
    metrics: {
      pending: active.length,
      urgent: active.filter((item) => item.priority === 'critical').length,
      approachingSla: active.filter((item) => classifySla(item.dueAt, now) === 'approaching').length,
      completedToday: items.filter((item) => item.status === 'resolved' && new Date(item.updatedAt) >= startOfDay).length,
    },
    bySource,
    topItems: filterAndSortWorkItems(active, defaultWorkQueueQuery).slice(0, 5),
  };
}
```

- [ ] **Step 4: Run the summary tests**

Run:

```bash
cd frontend/web
npm test -- src/application/work-items/build-dashboard-summary.test.ts
```

Expected: 1 test passes.

- [ ] **Step 5: Commit the dashboard rules**

```bash
git add frontend/web/src/application/work-items
git commit -m "feat: add dashboard summary rules"
```

## Task 5: Add the Mock Repository

**Files:**
- Create: `frontend/web/src/infrastructure/work-items/mock-work-items.ts`
- Create: `frontend/web/src/infrastructure/work-items/mock-work-item-repository.ts`
- Test: `frontend/web/src/infrastructure/work-items/mock-work-item-repository.test.ts`

- [ ] **Step 1: Write the failing repository test**

Create `frontend/web/src/infrastructure/work-items/mock-work-item-repository.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { MockWorkItemRepository } from './mock-work-item-repository';

describe('MockWorkItemRepository', () => {
  it('returns defensive copies of realistic items', async () => {
    const repository = new MockWorkItemRepository({ latencyMs: 0 });
    const first = await repository.findAll();
    first.pop();
    const second = await repository.findAll();
    expect(second).toHaveLength(9);
    expect(second.map((item) => item.source)).toEqual(expect.arrayContaining(['jira', 'salesforce', 'email']));
  });

  it('can simulate an infrastructure failure', async () => {
    const repository = new MockWorkItemRepository({ latencyMs: 0, shouldFail: true });
    await expect(repository.findAll()).rejects.toThrow('Não foi possível carregar sua fila.');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
cd frontend/web
npm test -- src/infrastructure/work-items/mock-work-item-repository.test.ts
```

Expected: FAIL because the repository does not exist.

- [ ] **Step 3: Create relative, realistic mock data**

Create `frontend/web/src/infrastructure/work-items/mock-work-items.ts`:

```ts
import type { WorkItem } from '@/domain/work-items/work-item';

const shiftHours = (date: Date, hours: number) => new Date(date.getTime() + hours * 3_600_000).toISOString();

export function createMockWorkItems(now = new Date()): WorkItem[] {
  return [
    { id: 'sf-1048', externalId: 'CASE-1048', source: 'salesforce', title: 'Acesso bloqueado para cliente', description: 'Cliente não consegue acessar o portal após a redefinição de senha.', status: 'new', priority: 'critical', assignee: 'Marcelo Santos', customer: 'ACME Brasil', createdAt: shiftHours(now, -8), updatedAt: shiftHours(now, -0.2), dueAt: shiftHours(now, 0.45), externalUrl: 'https://example.com/salesforce/CASE-1048' },
    { id: 'jira-1429', externalId: 'SP-1429', source: 'jira', title: 'Validar regra de faturamento', description: 'Confirmar o comportamento da regra para contratos com renovação automática.', status: 'in_progress', priority: 'high', assignee: 'Marcelo Santos', customer: 'Orbe Tecnologia', createdAt: shiftHours(now, -30), updatedAt: shiftHours(now, -2), dueAt: shiftHours(now, 3.2), externalUrl: 'https://example.com/jira/SP-1429' },
    { id: 'mail-889', externalId: 'MAIL-889', source: 'email', title: 'Responder solicitação de evidências', description: 'O time financeiro solicitou comprovantes do processamento de ontem.', status: 'waiting', priority: 'high', assignee: 'Marcelo Santos', customer: 'Financeiro interno', createdAt: shiftHours(now, -18), updatedAt: shiftHours(now, -6), dueAt: shiftHours(now, 6), externalUrl: 'https://example.com/email/MAIL-889' },
    { id: 'jira-1408', externalId: 'SP-1408', source: 'jira', title: 'Revisar documentação da integração', description: 'Revisar o passo a passo de configuração antes da publicação.', status: 'new', priority: 'medium', assignee: 'Ana Lima', customer: 'Nimbus', createdAt: shiftHours(now, -52), updatedAt: shiftHours(now, -9), dueAt: shiftHours(now, 28), externalUrl: 'https://example.com/jira/SP-1408' },
    { id: 'sf-1039', externalId: 'CASE-1039', source: 'salesforce', title: 'Divergência no relatório mensal', description: 'Totais do relatório não coincidem com o fechamento informado pelo cliente.', status: 'in_progress', priority: 'high', assignee: 'Marcelo Santos', customer: 'Vega Comércio', createdAt: shiftHours(now, -26), updatedAt: shiftHours(now, -4), dueAt: shiftHours(now, 15), externalUrl: 'https://example.com/salesforce/CASE-1039' },
    { id: 'mail-874', externalId: 'MAIL-874', source: 'email', title: 'Confirmar janela de manutenção', description: 'Responder com a confirmação da janela sugerida para sábado.', status: 'new', priority: 'medium', assignee: 'Marcelo Santos', customer: 'Horizonte Saúde', createdAt: shiftHours(now, -10), updatedAt: shiftHours(now, -3), dueAt: shiftHours(now, 22), externalUrl: 'https://example.com/email/MAIL-874' },
    { id: 'jira-1391', externalId: 'SP-1391', source: 'jira', title: 'Investigar lentidão na consulta', description: 'A consulta de contratos apresenta lentidão em horários de pico.', status: 'waiting', priority: 'low', assignee: 'João Alves', customer: 'Atlas Logística', createdAt: shiftHours(now, -72), updatedAt: shiftHours(now, -20), dueAt: shiftHours(now, 48), externalUrl: 'https://example.com/jira/SP-1391' },
    { id: 'sf-1021', externalId: 'CASE-1021', source: 'salesforce', title: 'Confirmar ajuste de cadastro', description: 'A alteração foi validada e comunicada ao cliente.', status: 'resolved', priority: 'medium', assignee: 'Marcelo Santos', customer: 'Delta Serviços', createdAt: shiftHours(now, -48), updatedAt: shiftHours(now, -1), externalUrl: 'https://example.com/salesforce/CASE-1021' },
    { id: 'mail-861', externalId: 'MAIL-861', source: 'email', title: 'Orientação sobre novo usuário', description: 'Instruções de primeiro acesso enviadas ao solicitante.', status: 'resolved', priority: 'low', assignee: 'Marcelo Santos', customer: 'Aurora Educação', createdAt: shiftHours(now, -36), updatedAt: shiftHours(now, -5), externalUrl: 'https://example.com/email/MAIL-861' },
  ];
}
```

- [ ] **Step 4: Implement the asynchronous repository adapter**

Create `frontend/web/src/infrastructure/work-items/mock-work-item-repository.ts`:

```ts
import type { WorkItemRepository } from '@/application/work-items/work-item-repository';
import { createMockWorkItems } from './mock-work-items';

type Options = { latencyMs?: number; shouldFail?: boolean };

export class MockWorkItemRepository implements WorkItemRepository {
  constructor(private readonly options: Options = {}) {}

  async findAll() {
    await new Promise((resolve) => setTimeout(resolve, this.options.latencyMs ?? 350));
    if (this.options.shouldFail) throw new Error('Não foi possível carregar sua fila.');
    return createMockWorkItems().map((item) => ({ ...item }));
  }
}

export const mockWorkItemRepository = new MockWorkItemRepository();
```

- [ ] **Step 5: Run the repository tests**

Run:

```bash
cd frontend/web
npm test -- src/infrastructure/work-items/mock-work-item-repository.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 6: Commit the mock adapter**

```bash
git add frontend/web/src/infrastructure
git commit -m "feat: add mock work item repository"
```

## Task 6: Establish the Theme, Providers, Loading Hook, and App Shell

**Files:**
- Create: `frontend/web/src/presentation/theme/theme.ts`
- Create: `frontend/web/src/presentation/providers/app-providers.tsx`
- Create: `frontend/web/src/presentation/hooks/use-work-items.ts`
- Test: `frontend/web/src/presentation/hooks/use-work-items.test.tsx`
- Create: `frontend/web/src/presentation/layouts/application-shell.tsx`
- Create: `frontend/web/src/presentation/layouts/application-shell.module.css`
- Modify: `frontend/web/src/app/layout.tsx`
- Modify: `frontend/web/src/app/globals.css`

- [ ] **Step 1: Write failing loading and retry hook tests**

Create `frontend/web/src/presentation/hooks/use-work-items.test.tsx`:

```tsx
import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import type { WorkItemRepository } from '@/application/work-items/work-item-repository';
import { createMockWorkItems } from '@/infrastructure/work-items/mock-work-items';
import { useWorkItems } from './use-work-items';

it('loads items and exposes a successful state', async () => {
  const repository: WorkItemRepository = { findAll: vi.fn().mockResolvedValue(createMockWorkItems()) };
  const { result } = renderHook(() => useWorkItems(repository));
  expect(result.current.status).toBe('loading');
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(result.current.items).toHaveLength(9);
});

it('retries after a repository failure', async () => {
  const findAll = vi.fn().mockRejectedValueOnce(new Error('Falha')).mockResolvedValueOnce(createMockWorkItems());
  const { result } = renderHook(() => useWorkItems({ findAll }));
  await waitFor(() => expect(result.current.status).toBe('error'));
  await act(async () => result.current.retry());
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(findAll).toHaveBeenCalledTimes(2);
});
```

- [ ] **Step 2: Run the hook test to verify it fails**

Run:

```bash
cd frontend/web
npm test -- src/presentation/hooks/use-work-items.test.tsx
```

Expected: FAIL because `use-work-items.ts` does not exist.

- [ ] **Step 3: Implement repository state handling**

Create `frontend/web/src/presentation/hooks/use-work-items.ts`:

```ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import type { WorkItemRepository } from '@/application/work-items/work-item-repository';
import type { WorkItem } from '@/domain/work-items/work-item';

type LoadStatus = 'loading' | 'success' | 'error';

export function useWorkItems(repository: WorkItemRepository) {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setStatus('loading');
    setError(undefined);
    try {
      setItems(await repository.findAll());
      setStatus('success');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar sua fila.');
      setStatus('error');
    }
  }, [repository]);

  useEffect(() => { void load(); }, [load]);

  return { items, status, error, retry: load };
}
```

- [ ] **Step 4: Add the approved Mantine theme and providers**

Create `frontend/web/src/presentation/theme/theme.ts`:

```ts
import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'brand',
  defaultRadius: 'md',
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  headings: { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', fontWeight: '700' },
  colors: {
    brand: ['#eef4ff', '#d9e5ff', '#b3c8ff', '#86a5ff', '#5c82f5', '#3f66e0', '#3154c5', '#2947a5', '#253f84', '#23386d'],
  },
});
```

Create `frontend/web/src/presentation/providers/app-providers.tsx`:

```tsx
'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '@/presentation/theme/theme';

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return <MantineProvider theme={theme}><Notifications position="top-right" />{children}</MantineProvider>;
}
```

- [ ] **Step 5: Build the responsive application shell**

Create `frontend/web/src/presentation/layouts/application-shell.tsx` with:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppShell, Avatar, Burger, Group, NavLink, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChartBar, IconHome, IconInbox, IconMail, IconSettings, IconStack2, IconTicket } from '@tabler/icons-react';
import classes from './application-shell.module.css';

const links = [
  { href: '/', label: 'Início', icon: IconHome },
  { href: '/queue', label: 'Minha Fila', icon: IconInbox, count: 12 },
  { href: '/jira', label: 'Jira', icon: IconStack2, count: 4 },
  { href: '/salesforce', label: 'Salesforce', icon: IconTicket, count: 5 },
  { href: '/emails', label: 'E-mails', icon: IconMail, count: 3 },
  { href: '/metrics', label: 'Métricas', icon: IconChartBar },
  { href: '/settings', label: 'Configurações', icon: IconSettings },
];

export function ApplicationShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [opened, { toggle, close }] = useDisclosure();
  const pathname = usePathname();
  return (
    <AppShell header={{ height: 72 }} navbar={{ width: 248, breakpoint: 'sm', collapsed: { mobile: !opened } }} padding="xl">
      <AppShell.Header className={classes.header}>
        <Group h="100%" px="lg" justify="space-between">
          <Group><Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" /><Title order={3} c="brand.7">Central N2</Title></Group>
          <Group gap="sm"><div><Text size="sm" fw={600}>Marcelo Santos</Text><Text size="xs" c="dimmed">Colaborador N2</Text></div><Avatar color="brand">MS</Avatar></Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md" className={classes.navbar}>
        <AppShell.Section grow component={ScrollArea}>
          <Stack gap={4}>{links.map(({ href, label, icon: Icon, count }) => <NavLink key={href} component={Link} href={href} label={label} leftSection={<Icon size={19} />} rightSection={count ? <Text size="xs" fw={700}>{count}</Text> : undefined} active={pathname === href} onClick={close} />)}</Stack>
        </AppShell.Section>
        <AppShell.Section><Text size="xs" c="dimmed">Ambiente de demonstração</Text></AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
```

Create `frontend/web/src/presentation/layouts/application-shell.module.css`:

```css
.header { background: rgba(255, 255, 255, 0.94); border-color: var(--mantine-color-gray-2); backdrop-filter: blur(10px); }
.navbar { background: var(--mantine-color-white); border-color: var(--mantine-color-gray-2); }
```

- [ ] **Step 6: Wire the root layout and global styles**

Replace `frontend/web/src/app/layout.tsx` with:

```tsx
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import type { Metadata } from 'next';
import { AppProviders } from '@/presentation/providers/app-providers';
import { ApplicationShell } from '@/presentation/layouts/application-shell';

export const metadata: Metadata = { title: 'Central N2', description: 'Sua central operacional de trabalho' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" {...mantineHtmlProps}><head><ColorSchemeScript defaultColorScheme="light" /></head><body><AppProviders><ApplicationShell>{children}</ApplicationShell></AppProviders></body></html>;
}
```

Replace `frontend/web/src/app/globals.css` with:

```css
:root { color-scheme: light; }
* { box-sizing: border-box; }
html, body { margin: 0; min-height: 100%; }
body { background: #f5f7fb; color: #182230; }
button, input, select { font: inherit; }
```

- [ ] **Step 7: Run hook tests, lint, and type checking**

Run:

```bash
cd frontend/web
npm test -- src/presentation/hooks/use-work-items.test.tsx
npm run lint
npm run typecheck
```

Expected: hook tests pass and both static checks exit with code 0.

- [ ] **Step 8: Commit the presentation foundation**

```bash
git add frontend/web/src/app frontend/web/src/presentation
git commit -m "feat: add application shell and providers"
```

## Task 7: Build the Operational Dashboard

**Files:**
- Create: `frontend/web/src/presentation/components/work-items/work-item-badges.tsx`
- Create: `frontend/web/src/presentation/components/work-items/work-item-drawer.tsx`
- Create: `frontend/web/src/presentation/pages/dashboard/dashboard-page.tsx`
- Create: `frontend/web/src/presentation/pages/dashboard/dashboard-page.module.css`
- Test: `frontend/web/src/presentation/pages/dashboard/dashboard-page.test.tsx`
- Replace: `frontend/web/src/app/page.tsx`

- [ ] **Step 1: Write a failing dashboard component test**

Create `frontend/web/src/presentation/pages/dashboard/dashboard-page.test.tsx`:

```tsx
import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import type { WorkItemRepository } from '@/application/work-items/work-item-repository';
import { createMockWorkItems } from '@/infrastructure/work-items/mock-work-items';
import { DashboardPage } from './dashboard-page';

const repository: WorkItemRepository = { findAll: async () => createMockWorkItems() };

it('shows operational metrics and opens an item detail', async () => {
  render(<MantineProvider><DashboardPage repository={repository} /></MantineProvider>);
  expect(await screen.findByText('Sua fila agora')).toBeInTheDocument();
  expect(screen.getByText('Pendentes')).toBeInTheDocument();
  expect(screen.getAllByText('Salesforce').length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('button', { name: /abrir detalhes de CASE-1048/i }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Acesso bloqueado para cliente');
  expect(screen.getByRole('link', { name: /abrir na ferramenta original/i })).toHaveAttribute('href', 'https://example.com/salesforce/CASE-1048');
});
```

- [ ] **Step 2: Run the dashboard test to verify it fails**

Run:

```bash
cd frontend/web
npm test -- src/presentation/pages/dashboard/dashboard-page.test.tsx
```

Expected: FAIL because `dashboard-page.tsx` does not exist.

- [ ] **Step 3: Create reusable work-item badges**

Create `frontend/web/src/presentation/components/work-items/work-item-badges.tsx`:

```tsx
import { Badge, Group } from '@mantine/core';
import type { WorkItemPriority, WorkItemSource, WorkItemStatus } from '@/domain/work-items/work-item';
import { classifySla, formatDuration, getRemainingSlaMs } from '@/domain/work-items/sla';

const sourceLabels: Record<WorkItemSource, string> = { jira: 'Jira', salesforce: 'Salesforce', email: 'E-mail' };
const statusLabels: Record<WorkItemStatus, string> = { new: 'Novo', in_progress: 'Em andamento', waiting: 'Aguardando', resolved: 'Resolvido' };
const statusColors: Record<WorkItemStatus, string> = { new: 'blue', in_progress: 'violet', waiting: 'orange', resolved: 'green' };
const priorityLabels: Record<WorkItemPriority, string> = { critical: 'Crítica', high: 'Alta', medium: 'Média', low: 'Baixa' };
const priorityColors: Record<WorkItemPriority, string> = { critical: 'red', high: 'orange', medium: 'yellow', low: 'gray' };

export function SourceBadge({ source }: { source: WorkItemSource }) { return <Badge variant="light" color="gray">{sourceLabels[source]}</Badge>; }
export function StatusBadge({ status }: { status: WorkItemStatus }) { return <Badge variant="light" color={statusColors[status]}>{statusLabels[status]}</Badge>; }
export function PriorityBadge({ priority }: { priority: WorkItemPriority }) { return <Badge variant="dot" color={priorityColors[priority]}>{priorityLabels[priority]}</Badge>; }
export function SlaBadge({ dueAt, now = new Date() }: { dueAt?: string; now?: Date }) {
  const state = classifySla(dueAt, now);
  if (state === 'unavailable') return <Badge variant="light" color="gray">Sem SLA</Badge>;
  const colors = { critical: 'red', approaching: 'orange', healthy: 'green' } as const;
  return <Badge variant="light" color={colors[state]}>{formatDuration(getRemainingSlaMs(dueAt, now)!)}</Badge>;
}
export function WorkItemBadgeGroup({ source, status, priority }: { source: WorkItemSource; status: WorkItemStatus; priority: WorkItemPriority }) {
  return <Group gap={6}><SourceBadge source={source} /><StatusBadge status={status} /><PriorityBadge priority={priority} /></Group>;
}
```

- [ ] **Step 4: Create the item detail drawer**

Create `frontend/web/src/presentation/components/work-items/work-item-drawer.tsx`:

```tsx
import { Button, Divider, Drawer, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import type { WorkItem } from '@/domain/work-items/work-item';
import { SlaBadge, WorkItemBadgeGroup } from './work-item-badges';

const formatDate = (value: string) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export function WorkItemDrawer({ item, opened, onClose }: { item?: WorkItem; opened: boolean; onClose: () => void }) {
  return (
    <Drawer opened={opened} onClose={onClose} position="right" size="md" title="Detalhes do item">
      {item && <Stack gap="lg">
        <div><Text size="sm" c="dimmed" fw={600}>{item.externalId}</Text><Title order={3}>{item.title}</Title></div>
        <WorkItemBadgeGroup source={item.source} status={item.status} priority={item.priority} />
        <Text>{item.description}</Text><Divider />
        <SimpleGrid cols={2} spacing="lg">
          <div><Text size="xs" c="dimmed">Cliente</Text><Text fw={600}>{item.customer ?? 'Não informado'}</Text></div>
          <div><Text size="xs" c="dimmed">Responsável</Text><Text fw={600}>{item.assignee ?? 'Não atribuído'}</Text></div>
          <div><Text size="xs" c="dimmed">Última atualização</Text><Text fw={600}>{formatDate(item.updatedAt)}</Text></div>
          <div><Text size="xs" c="dimmed">SLA</Text><Group mt={4}><SlaBadge dueAt={item.dueAt} /></Group></div>
        </SimpleGrid>
        <Button component="a" href={item.externalUrl} target="_blank" rel="noreferrer" rightSection={<IconExternalLink size={16} />}>Abrir na ferramenta original</Button>
      </Stack>}
    </Drawer>
  );
}
```

- [ ] **Step 5: Implement the dashboard screen**

Create `frontend/web/src/presentation/pages/dashboard/dashboard-page.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { Alert, Button, Group, Paper, Progress, SimpleGrid, Skeleton, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertTriangle, IconCheck, IconClock, IconInbox } from '@tabler/icons-react';
import { useState } from 'react';
import type { WorkItemRepository } from '@/application/work-items/work-item-repository';
import { buildDashboardSummary } from '@/application/work-items/build-dashboard-summary';
import type { WorkItem } from '@/domain/work-items/work-item';
import { useWorkItems } from '@/presentation/hooks/use-work-items';
import { SourceBadge, SlaBadge, StatusBadge } from '@/presentation/components/work-items/work-item-badges';
import { WorkItemDrawer } from '@/presentation/components/work-items/work-item-drawer';
import classes from './dashboard-page.module.css';

const metricConfig = [
  { key: 'pending', label: 'Pendentes', color: 'blue', icon: IconInbox },
  { key: 'urgent', label: 'Urgentes', color: 'red', icon: IconAlertTriangle },
  { key: 'approachingSla', label: 'SLA próximo', color: 'orange', icon: IconClock },
  { key: 'completedToday', label: 'Concluídos hoje', color: 'green', icon: IconCheck },
] as const;

export function DashboardPage({ repository }: { repository: WorkItemRepository }) {
  const { items, status, error, retry } = useWorkItems(repository);
  const [selected, setSelected] = useState<WorkItem>();
  const [opened, { open, close }] = useDisclosure();
  if (status === 'loading') return <Stack><Skeleton height={72} /><SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>{metricConfig.map(({ key }) => <Skeleton key={key} height={118} />)}</SimpleGrid><Skeleton height={320} /></Stack>;
  if (status === 'error') return <Alert color="red" title="Não foi possível carregar o painel">{error}<Button variant="light" color="red" ml="md" onClick={() => void retry()}>Tentar novamente</Button></Alert>;
  const summary = buildDashboardSummary(items);
  const today = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date());
  const inspect = (item: WorkItem) => { setSelected(item); open(); };
  return <Stack gap="xl">
    <Group justify="space-between" align="flex-end"><div><Text c="dimmed" size="sm">{today}</Text><Title order={1}>Bom dia, Marcelo</Title><Text c="dimmed">Aqui está o que precisa da sua atenção agora.</Text></div><Button component={Link} href="/queue">Ver fila completa</Button></Group>
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>{metricConfig.map(({ key, label, color, icon: Icon }) => <Paper key={key} withBorder p="lg" radius="lg"><Group justify="space-between"><div><Text size="sm" c="dimmed">{label}</Text><Text fz={30} fw={800}>{summary.metrics[key]}</Text></div><ThemeIcon color={color} variant="light" size={44} radius="md"><Icon size={22} /></ThemeIcon></Group></Paper>)}</SimpleGrid>
    <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="xl">
      <Paper withBorder p="lg" radius="lg" className={classes.queuePanel}><Group justify="space-between" mb="md"><div><Title order={3}>Sua fila agora</Title><Text size="sm" c="dimmed">Ordenada pelo que requer ação primeiro</Text></div><Button component={Link} href="/queue" variant="subtle">Ver todos</Button></Group><Stack gap="xs">{summary.topItems.map((item) => <button className={classes.itemButton} key={item.id} onClick={() => inspect(item)} aria-label={`Abrir detalhes de ${item.externalId}`}><div><Group gap="xs"><SourceBadge source={item.source} /><Text size="xs" c="dimmed">{item.externalId}</Text></Group><Text fw={650} mt={6}>{item.title}</Text><Text size="sm" c="dimmed">{item.customer}</Text></div><Stack gap={6} align="flex-end"><StatusBadge status={item.status} /><SlaBadge dueAt={item.dueAt} /></Stack></button>)}</Stack></Paper>
      <Paper withBorder p="lg" radius="lg"><Title order={3}>Itens por origem</Title><Text size="sm" c="dimmed" mb="xl">Distribuição da sua fila atual</Text><Stack gap="lg">{([['Jira', summary.bySource.jira, 'indigo'], ['Salesforce', summary.bySource.salesforce, 'cyan'], ['E-mail', summary.bySource.email, 'grape']] as const).map(([label, value, color]) => <div key={label}><Group justify="space-between"><Text fw={600}>{label}</Text><Text fw={700}>{value}</Text></Group><Progress value={(value / items.length) * 100} color={color} mt={6} /></div>)}</Stack></Paper>
    </SimpleGrid>
    <WorkItemDrawer item={selected} opened={opened} onClose={close} />
  </Stack>;
}
```

Create `frontend/web/src/presentation/pages/dashboard/dashboard-page.module.css`:

```css
.queuePanel { grid-column: span 2; }
.itemButton { width: 100%; display: flex; justify-content: space-between; gap: 1rem; text-align: left; border: 1px solid var(--mantine-color-gray-2); background: var(--mantine-color-white); border-radius: var(--mantine-radius-md); padding: 0.9rem; cursor: pointer; transition: border-color 120ms ease, transform 120ms ease; }
.itemButton:hover { border-color: var(--mantine-color-brand-4); transform: translateY(-1px); }
@media (max-width: 62em) { .queuePanel { grid-column: auto; } }
```

- [ ] **Step 6: Make the App Router route a thin composition root**

Replace `frontend/web/src/app/page.tsx` with:

```tsx
'use client';

import { mockWorkItemRepository } from '@/infrastructure/work-items/mock-work-item-repository';
import { DashboardPage } from '@/presentation/pages/dashboard/dashboard-page';

export default function Home() { return <DashboardPage repository={mockWorkItemRepository} />; }
```

- [ ] **Step 7: Run the dashboard test and static checks**

Run:

```bash
cd frontend/web
npm test -- src/presentation/pages/dashboard/dashboard-page.test.tsx
npm run lint
npm run typecheck
```

Expected: the dashboard test passes and static checks exit with code 0.

- [ ] **Step 8: Commit the dashboard**

```bash
git add frontend/web/src/app/page.tsx frontend/web/src/presentation/components frontend/web/src/presentation/pages/dashboard
git commit -m "feat: add operational dashboard"
```

## Task 8: Build the Searchable Unified Queue

**Files:**
- Create: `frontend/web/src/presentation/pages/queue/work-queue.tsx`
- Create: `frontend/web/src/presentation/pages/queue/queue-page.tsx`
- Create: `frontend/web/src/presentation/pages/queue/queue-page.module.css`
- Test: `frontend/web/src/presentation/pages/queue/queue-page.test.tsx`
- Create: `frontend/web/src/app/queue/page.tsx`

- [ ] **Step 1: Write failing queue interaction tests**

Create `frontend/web/src/presentation/pages/queue/queue-page.test.tsx`:

```tsx
import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import type { WorkItemRepository } from '@/application/work-items/work-item-repository';
import { createMockWorkItems } from '@/infrastructure/work-items/mock-work-items';
import { QueuePage } from './queue-page';

const renderPage = (repository: WorkItemRepository) => render(<MantineProvider><QueuePage repository={repository} /></MantineProvider>);

it('searches the queue and opens item details', async () => {
  const user = userEvent.setup();
  renderPage({ findAll: async () => createMockWorkItems() });
  const search = await screen.findByRole('searchbox', { name: /buscar na fila/i });
  await user.type(search, 'ACME');
  expect(screen.getByText('Acesso bloqueado para cliente')).toBeInTheDocument();
  expect(screen.queryByText('Validar regra de faturamento')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /abrir detalhes de CASE-1048/i }));
  expect(screen.getByRole('dialog')).toHaveTextContent('ACME Brasil');
});

it('shows an empty state when no item matches', async () => {
  const user = userEvent.setup();
  renderPage({ findAll: async () => createMockWorkItems() });
  await user.type(await screen.findByRole('searchbox', { name: /buscar na fila/i }), 'nenhum-item-existe');
  expect(screen.getByText('Nenhum item encontrado')).toBeInTheDocument();
});

it('shows an error and retries loading', async () => {
  const findAll = vi.fn().mockRejectedValueOnce(new Error('Falha temporária')).mockResolvedValueOnce(createMockWorkItems());
  renderPage({ findAll });
  expect(await screen.findByText('Falha temporária')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));
  await waitFor(() => expect(screen.getByText('Minha Fila')).toBeInTheDocument());
  expect(findAll).toHaveBeenCalledTimes(2);
});
```

- [ ] **Step 2: Run the queue tests to verify they fail**

Run:

```bash
cd frontend/web
npm test -- src/presentation/pages/queue/queue-page.test.tsx
```

Expected: FAIL because the queue components do not exist.

- [ ] **Step 3: Implement the queue table, filters, sorting, empty state, and drawer**

Create `frontend/web/src/presentation/pages/queue/work-queue.tsx`:

```tsx
'use client';

import { Alert, Button, Group, Paper, Select, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconFilterOff, IconRefresh, IconSearch } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { filterAndSortWorkItems } from '@/application/work-items/filter-and-sort-work-items';
import { defaultWorkQueueQuery, type WorkQueueQuery } from '@/application/work-items/work-queue-query';
import type { WorkItem } from '@/domain/work-items/work-item';
import { PriorityBadge, SlaBadge, SourceBadge, StatusBadge } from '@/presentation/components/work-items/work-item-badges';
import { WorkItemDrawer } from '@/presentation/components/work-items/work-item-drawer';
import classes from './queue-page.module.css';

const sourceOptions = [{ value: 'all', label: 'Todas as origens' }, { value: 'jira', label: 'Jira' }, { value: 'salesforce', label: 'Salesforce' }, { value: 'email', label: 'E-mail' }];
const statusOptions = [{ value: 'all', label: 'Todos os status' }, { value: 'new', label: 'Novo' }, { value: 'in_progress', label: 'Em andamento' }, { value: 'waiting', label: 'Aguardando' }, { value: 'resolved', label: 'Resolvido' }];
const priorityOptions = [{ value: 'all', label: 'Todas as prioridades' }, { value: 'critical', label: 'Crítica' }, { value: 'high', label: 'Alta' }, { value: 'medium', label: 'Média' }, { value: 'low', label: 'Baixa' }];
const sortOptions = [{ value: 'urgency', label: 'Urgência' }, { value: 'sla', label: 'SLA' }, { value: 'updated', label: 'Última atualização' }];

export function WorkQueue({ items }: { items: WorkItem[] }) {
  const [query, setQuery] = useState<WorkQueueQuery>(defaultWorkQueueQuery);
  const [selected, setSelected] = useState<WorkItem>();
  const [opened, { open, close }] = useDisclosure();
  const result = useMemo(() => filterAndSortWorkItems(items, query), [items, query]);
  const update = <Key extends keyof WorkQueueQuery>(key: Key, value: WorkQueueQuery[Key]) => setQuery((current) => ({ ...current, [key]: value }));
  const inspect = (item: WorkItem) => { setSelected(item); open(); };
  const hasFilters = query.search !== '' || query.source !== 'all' || query.status !== 'all' || query.priority !== 'all';
  return <Stack gap="lg">
    <Group justify="space-between" align="flex-end"><div><Title order={1}>Minha Fila</Title><Text c="dimmed">Itens de Jira, Salesforce e E-mail em uma única visão.</Text></div><Button leftSection={<IconRefresh size={16} />} variant="light" onClick={() => notifications.show({ title: 'Fila atualizada', message: 'Os dados mockados foram recarregados para demonstração.', color: 'green' })}>Sincronizar</Button></Group>
    <Paper withBorder p="md" radius="lg"><div className={classes.filters}><TextInput role="searchbox" aria-label="Buscar na fila" placeholder="Buscar por item, cliente ou responsável" leftSection={<IconSearch size={16} />} value={query.search} onChange={(event) => update('search', event.currentTarget.value)} /><Select aria-label="Filtrar por origem" data={sourceOptions} value={query.source} onChange={(value) => update('source', (value ?? 'all') as WorkQueueQuery['source'])} /><Select aria-label="Filtrar por status" data={statusOptions} value={query.status} onChange={(value) => update('status', (value ?? 'all') as WorkQueueQuery['status'])} /><Select aria-label="Filtrar por prioridade" data={priorityOptions} value={query.priority} onChange={(value) => update('priority', (value ?? 'all') as WorkQueueQuery['priority'])} /><Select aria-label="Ordenar por" data={sortOptions} value={query.sort} onChange={(value) => update('sort', (value ?? 'urgency') as WorkQueueQuery['sort'])} /></div></Paper>
    <Paper withBorder radius="lg" className={classes.tablePanel}>
      <Group justify="space-between" p="md"><Text fw={700}>{result.length} {result.length === 1 ? 'item' : 'itens'}</Text>{hasFilters && <Button variant="subtle" color="gray" leftSection={<IconFilterOff size={16} />} onClick={() => setQuery(defaultWorkQueueQuery)}>Limpar filtros</Button>}</Group>
      {result.length === 0 ? <Alert m="md" title="Nenhum item encontrado" color="gray">Ajuste os filtros ou limpe a busca para visualizar outros itens.</Alert> : <Table.ScrollContainer minWidth={900}><Table verticalSpacing="md" highlightOnHover><Table.Thead><Table.Tr><Table.Th>Origem</Table.Th><Table.Th>Item</Table.Th><Table.Th>Cliente</Table.Th><Table.Th>Status</Table.Th><Table.Th>Prioridade</Table.Th><Table.Th>SLA</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{result.map((item) => <Table.Tr key={item.id} className={classes.row} role="button" tabIndex={0} aria-label={`Abrir detalhes de ${item.externalId}`} onClick={() => inspect(item)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') inspect(item); }}><Table.Td><SourceBadge source={item.source} /></Table.Td><Table.Td><Text fw={650}>{item.title}</Text><Text size="xs" c="dimmed">{item.externalId}</Text></Table.Td><Table.Td>{item.customer ?? 'Não informado'}</Table.Td><Table.Td><StatusBadge status={item.status} /></Table.Td><Table.Td><PriorityBadge priority={item.priority} /></Table.Td><Table.Td><SlaBadge dueAt={item.dueAt} /></Table.Td></Table.Tr>)}</Table.Tbody></Table></Table.ScrollContainer>}
    </Paper>
    <WorkItemDrawer item={selected} opened={opened} onClose={close} />
  </Stack>;
}
```

Create `frontend/web/src/presentation/pages/queue/queue-page.module.css`:

```css
.filters { display: grid; grid-template-columns: minmax(16rem, 2fr) repeat(4, minmax(9rem, 1fr)); gap: 0.75rem; }
.tablePanel { overflow: hidden; }
.row { cursor: pointer; }
.row:focus-visible { outline: 2px solid var(--mantine-color-brand-5); outline-offset: -2px; }
@media (max-width: 75em) { .filters { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 48em) { .filters { grid-template-columns: 1fr; } }
```

- [ ] **Step 4: Implement loading, error, and retry orchestration**

Create `frontend/web/src/presentation/pages/queue/queue-page.tsx`:

```tsx
'use client';

import { Alert, Button, Skeleton, Stack } from '@mantine/core';
import type { WorkItemRepository } from '@/application/work-items/work-item-repository';
import { useWorkItems } from '@/presentation/hooks/use-work-items';
import { WorkQueue } from './work-queue';

export function QueuePage({ repository }: { repository: WorkItemRepository }) {
  const { items, status, error, retry } = useWorkItems(repository);
  if (status === 'loading') return <Stack><Skeleton height={72} /><Skeleton height={68} /><Skeleton height={420} /></Stack>;
  if (status === 'error') return <Alert color="red" title="Não foi possível carregar a fila">{error}<Button variant="light" color="red" ml="md" onClick={() => void retry()}>Tentar novamente</Button></Alert>;
  return <WorkQueue items={items} />;
}
```

- [ ] **Step 5: Add the thin queue route**

Create `frontend/web/src/app/queue/page.tsx`:

```tsx
'use client';

import { mockWorkItemRepository } from '@/infrastructure/work-items/mock-work-item-repository';
import { QueuePage } from '@/presentation/pages/queue/queue-page';

export default function QueueRoute() { return <QueuePage repository={mockWorkItemRepository} />; }
```

- [ ] **Step 6: Run queue tests and quality checks**

Run:

```bash
cd frontend/web
npm test -- src/presentation/pages/queue/queue-page.test.tsx
npm run lint
npm run typecheck
```

Expected: 3 queue tests pass and static checks exit with code 0.

- [ ] **Step 7: Commit the unified queue**

```bash
git add frontend/web/src/app/queue frontend/web/src/presentation/pages/queue
git commit -m "feat: add unified work queue"
```

## Task 9: Wire the Root Layout and Future-Section Routes

**Files:**
- Create: `frontend/web/src/presentation/pages/future-section/future-section-page.tsx`
- Modify: `frontend/web/src/app/layout.tsx`
- Modify: `frontend/web/src/app/globals.css`
- Create: `frontend/web/src/app/jira/page.tsx`
- Create: `frontend/web/src/app/salesforce/page.tsx`
- Create: `frontend/web/src/app/emails/page.tsx`
- Create: `frontend/web/src/app/metrics/page.tsx`
- Create: `frontend/web/src/app/settings/page.tsx`

- [ ] **Step 1: Create the reusable future-section screen**

Create `frontend/web/src/presentation/pages/future-section/future-section-page.tsx`:

```tsx
import Link from 'next/link';
import { Button, Center, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconClockHour4 } from '@tabler/icons-react';

export function FutureSectionPage({ title, description }: { title: string; description: string }) {
  return <Center mih="65vh"><Paper withBorder radius="lg" p="xl" maw={520} w="100%"><Stack align="center" ta="center"><ThemeIcon size={56} radius="xl" variant="light"><IconClockHour4 size={28} /></ThemeIcon><Title order={2}>{title}</Title><Text c="dimmed">{description}</Text><Text size="sm" c="dimmed">Esta área será adicionada em uma próxima etapa. Sua fila unificada já representa os itens dessa origem.</Text><Button component={Link} href="/queue" mt="md">Voltar para Minha Fila</Button></Stack></Paper></Center>;
}
```

- [ ] **Step 2: Configure the root Mantine layout and global styles**

Replace `frontend/web/src/app/layout.tsx` with:

```tsx
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';
import type { Metadata } from 'next';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { ApplicationShell } from '@/presentation/layouts/application-shell';
import { AppProviders } from '@/presentation/providers/app-providers';

export const metadata: Metadata = {
  title: { default: 'Central N2', template: '%s | Central N2' },
  description: 'Central operacional de pendências do Jira, Salesforce e E-mail.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" {...mantineHtmlProps}><head><ColorSchemeScript defaultColorScheme="light" /></head><body><AppProviders><ApplicationShell>{children}</ApplicationShell></AppProviders></body></html>;
}
```

Replace `frontend/web/src/app/globals.css` with:

```css
:root { color-scheme: light; }
* { box-sizing: border-box; }
html, body { min-height: 100%; }
body { margin: 0; background: #f5f7fb; color: #182230; }
button, input, select, textarea { font: inherit; }
```

- [ ] **Step 3: Add explicit future-section routes**

Create `frontend/web/src/app/jira/page.tsx`:

```tsx
import { FutureSectionPage } from '@/presentation/pages/future-section/future-section-page';
export default function JiraRoute() { return <FutureSectionPage title="Jira" description="A visão dedicada de solicitações e comentários do Jira está planejada." />; }
```

Create `frontend/web/src/app/salesforce/page.tsx`:

```tsx
import { FutureSectionPage } from '@/presentation/pages/future-section/future-section-page';
export default function SalesforceRoute() { return <FutureSectionPage title="Salesforce" description="A visão dedicada de casos e respostas do Salesforce está planejada." />; }
```

Create `frontend/web/src/app/emails/page.tsx`:

```tsx
import { FutureSectionPage } from '@/presentation/pages/future-section/future-section-page';
export default function EmailsRoute() { return <FutureSectionPage title="E-mails" description="A visão dedicada de mensagens e conversas pendentes está planejada." />; }
```

Create `frontend/web/src/app/metrics/page.tsx`:

```tsx
import { FutureSectionPage } from '@/presentation/pages/future-section/future-section-page';
export default function MetricsRoute() { return <FutureSectionPage title="Métricas" description="Indicadores operacionais adicionais serão incluídos quando apoiarem decisões reais." />; }
```

Create `frontend/web/src/app/settings/page.tsx`:

```tsx
import { FutureSectionPage } from '@/presentation/pages/future-section/future-section-page';
export default function SettingsRoute() { return <FutureSectionPage title="Configurações" description="Preferências pessoais e configurações de integração serão disponibilizadas futuramente." />; }
```

- [ ] **Step 4: Verify every route through the production build**

Run:

```bash
cd frontend/web
npm run lint
npm run typecheck
npm run build
```

Expected: all checks pass and the build output lists `/`, `/queue`, `/jira`, `/salesforce`, `/emails`, `/metrics`, and `/settings`.

- [ ] **Step 5: Commit the complete navigation**

```bash
git add frontend/web/src/app frontend/web/src/presentation/pages/future-section
git commit -m "feat: add frontend navigation routes"
```

## Task 10: Add Docker Development and Production Builds

**Files:**
- Create: `frontend/web/Dockerfile`
- Create: `frontend/web/.dockerignore`
- Create: `docker-compose.yml`
- Create: `README.md`

- [ ] **Step 1: Add a non-root multi-stage Dockerfile**

Create `frontend/web/Dockerfile`:

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 2: Keep the Docker context small**

Create `frontend/web/.dockerignore`:

```dockerignore
node_modules
.next
coverage
.env
.env.*
!.env.example
.git
*.log
```

- [ ] **Step 3: Add frontend-only development orchestration**

Create `docker-compose.yml`:

```yaml
services:
  frontend:
    build:
      context: ./frontend/web
      target: development
    environment:
      NEXT_PUBLIC_APP_NAME: ${NEXT_PUBLIC_APP_NAME:-Central N2}
      WATCHPACK_POLLING: "true"
    ports:
      - "3000:3000"
    volumes:
      - ./frontend/web:/app
      - frontend_node_modules:/app/node_modules
      - frontend_next:/app/.next
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 6
      start_period: 30s

volumes:
  frontend_node_modules:
  frontend_next:
```

- [ ] **Step 4: Document the frontend-only workflow**

Create `README.md`:

````markdown
# Central N2

Frontend inicial da central operacional que unifica pendências de Jira, Salesforce e E-mail.

## Executar com Docker

```bash
cp frontend/web/.env.example frontend/web/.env
docker compose up --build
```

Acesse `http://localhost:3000`. Alterações em `frontend/web` são recarregadas durante o desenvolvimento.

## Executar sem Docker

Requer Node.js 22 e npm.

```bash
cd frontend/web
npm ci
npm run dev
```

## Qualidade

```bash
cd frontend/web
npm run lint
npm run typecheck
npm test
npm run build
```

Nesta etapa, todos os dados são mocks locais. Não há backend nem credenciais de integração.
````

- [ ] **Step 5: Validate the production image**

Run:

```bash
docker build --target production -t dashboard-n2-frontend:test frontend/web
```

Expected: the Next.js build completes and the final image uses the `nextjs` user.

- [ ] **Step 6: Validate Docker Compose configuration and health**

Run:

```bash
docker compose config
docker compose up -d --build
docker compose ps
```

Expected: Compose configuration is valid and `frontend` transitions to `healthy` at `http://localhost:3000`.

- [ ] **Step 7: Run the complete verification suite**

Run:

```bash
cd frontend/web
npm run lint
npm run typecheck
npm test
npm run build
cd ../..
git status --short
```

Expected: lint, typecheck, tests, and build pass. Git status contains only intentional project files and any pre-existing untracked `AGENTS.md`.

- [ ] **Step 8: Commit container support and documentation**

```bash
git add frontend/web/Dockerfile frontend/web/.dockerignore docker-compose.yml README.md
git commit -m "chore: add frontend container workflow"
```
