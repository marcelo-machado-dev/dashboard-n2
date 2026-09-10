# Frontend MVP Design

## Goal

Build only the first frontend slice of the operational dashboard. The application must help a collaborator quickly understand what needs attention now while keeping Jira, Salesforce, and email clearly identified inside one unified queue.

This phase uses realistic mock data. It does not include backend services, authentication, persistence, or external integrations.

## Scope

The frontend includes:

- a Next.js application using React, TypeScript, Mantine, Mantine Hooks, Mantine Notifications, and Tabler Icons;
- a responsive AppShell with a light sidebar, header, and route navigation;
- an operational home dashboard;
- a unified work queue with search, filters, sorting, and a detail drawer;
- placeholder pages for future Jira, Salesforce, email, metrics, and settings sections;
- unit and component tests for the central behaviors;
- a standalone Dockerfile with development hot reload;
- a Docker Compose file containing only the frontend service in this phase;
- safe environment variable documentation in `.env.example`.

The frontend is desktop-first but remains usable on smaller screens. The sidebar collapses when space is constrained, and wide data tables may scroll horizontally.

## Routes

- `/`: operational dashboard;
- `/queue`: unified "Minha Fila" view;
- `/jira`: future-feature placeholder;
- `/salesforce`: future-feature placeholder;
- `/emails`: future-feature placeholder;
- `/metrics`: future-feature placeholder;
- `/settings`: future-feature placeholder.

## Visual Direction

The approved visual direction is balanced rather than sparse or high-density:

- light gray application background;
- white cards and navigation surfaces;
- dark, readable typography;
- compact metric cards;
- a clear unified-queue focus;
- strong colors reserved for status, urgency, SLA, feedback, and primary actions;
- source indicated through a small icon or secondary badge, never as a substitute for status color.

The sidebar is light and simple. The header contains a greeting, a compact search affordance, and the user menu.

## Dashboard

The home dashboard includes:

- cards for pending items, urgent items, items approaching SLA, and items completed today;
- a "Sua fila agora" section focused on the most urgent work;
- a compact breakdown by source;
- direct actions to open the complete queue or inspect an item;
- no decorative charts.

## Unified Queue

The queue supports:

- search over identifier, title, customer, and assignee;
- filters by source, status, and priority;
- sorting by urgency, SLA, or last update;
- an operational table showing source, identifier and title, customer, status, priority, and SLA;
- a row click that opens a detail drawer;
- a detail drawer showing the description, source, external identifier, customer, assignee, dates, status, priority, and SLA;
- a safe mock "Abrir na ferramenta original" action.

Pagination and bulk selection are not part of this increment.

## Architecture

The frontend follows pragmatic Clean Architecture boundaries without adding unnecessary abstractions:

```text
Component
    |
    v
Presentation hook / application use case
    |
    v
WorkItemRepository interface
    |
    v
MockWorkItemRepository
```

Recommended source structure:

```text
frontend/web/src/
├── app/
├── domain/
│   └── work-items/
├── application/
│   └── work-items/
├── infrastructure/
│   └── work-items/
├── presentation/
│   ├── components/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   └── providers/
└── shared/
```

The `app` routes remain thin and render presentation-level page components. Domain code does not import React, Next.js, Mantine, or infrastructure packages.

## Data and State Flow

Work item data comes from a `MockWorkItemRepository` through an application use case. Replacing mock data with the future Gateway requires a new HTTP repository implementation, not changes to page components or domain types.

Search, filtering, sorting, and SLA classification are application or domain concerns. Drawer visibility, mobile navigation, and similar view state remain in presentation hooks and components.

## Loading, Empty, and Error States

- `Skeleton` components represent initial loading.
- A contextual empty state appears when filters return no items.
- Repository failures render an `Alert` with a retry action.
- SLA is classified consistently as critical, approaching, healthy, or unavailable.
- A simulated synchronization action shows a notification without implying that an external integration occurred.

## Docker

`frontend/web` has its own `Dockerfile` and `.dockerignore`. The root `docker-compose.yml` initially defines only the frontend service. Development uses a source volume and dependency volume so code changes trigger hot reload without overwriting container dependencies.

No backend, database, Redis, or message broker is introduced in this phase.

## Testing and Acceptance

The increment is complete when:

- unit tests cover search, filters, sorting, and SLA classification;
- component tests cover the dashboard, queue interactions, empty state, and detail drawer;
- lint, TypeScript checks, tests, and the production build pass;
- the frontend Docker image builds independently;
- Docker Compose starts the frontend with hot reload configuration;
- all routes render without requiring a backend;
- no secrets or integration credentials exist in frontend code or committed configuration.

## Explicitly Out of Scope

- real authentication or authorization;
- HTTP calls and backend services;
- Jira, Salesforce, or email integrations;
- database or preference persistence;
- actions that mutate work items;
- notifications from real systems;
- analytics beyond operational summary metrics.
