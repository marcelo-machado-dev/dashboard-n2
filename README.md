# Central N2

Frontend inicial da central operacional que unifica pendências de Jira,
Salesforce e E-mail.

Neste momento o projeto entrega somente o front, usando dados mockados. As
integrações reais devem passar futuramente pelo backend/gateway, sem acesso
direto do navegador ao Jira, Salesforce ou provedores de e-mail.

## Executar com Docker

```bash
cp frontend/web/.env.example frontend/web/.env
docker compose up --build
```

Acesse `http://localhost:3000`. Alterações em `frontend/web` são recarregadas
durante o desenvolvimento.

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
