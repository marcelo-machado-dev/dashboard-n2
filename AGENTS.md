# AGENTS.md

## Projeto

Este projeto é uma central operacional para colaboradores acompanharem e gerenciarem, em um único lugar, itens vindos de diferentes ferramentas.

Fontes principais:

* Jira
* Salesforce
* E-mail

O objetivo não é substituir essas plataformas.

O sistema deve funcionar como uma camada central de trabalho que permita ao usuário responder rapidamente à pergunta:

> O que eu preciso fazer agora?

A aplicação deve reduzir a troca de contexto entre ferramentas e concentrar pendências, prioridades, alertas e ações recorrentes.

---

# Visão de arquitetura

A solução será dividida em projetos independentes de frontend e backend.

Estrutura conceitual:

```text
Frontend
   |
   v
API Gateway / BFF
   |
   +-------------------+
   |                   |
   v                   v
Work Items          Integrations
Service             Services
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
        Jira        Salesforce      Email
```

O frontend nunca deve acessar diretamente Jira, Salesforce ou provedores de e-mail.

Toda comunicação com serviços externos deve passar pelo backend.

---

# Estrutura geral

Organizar os projetos preferencialmente assim:

```text
workspace/
│
├── frontend/
│   └── web/
│
├── backend/
│   ├── gateway/
│   ├── work-items-service/
│   ├── jira-service/
│   ├── salesforce-service/
│   ├── email-service/
│   └── notification-service/
│
├── packages/
│   └── shared-contracts/
│
├── docker/
│
├── docker-compose.yml
│
└── docs/
```

Cada serviço deve ser independente.

Não criar dependência direta entre implementações internas de serviços.

A comunicação deve ocorrer através de contratos bem definidos.

---

# Docker

Todo o ambiente deve ser gerenciado com Docker.

Frontend, backend, bancos de dados e demais dependências de infraestrutura devem possuir configuração Docker quando aplicável.

O objetivo é permitir que o projeto seja executado de forma consistente em qualquer ambiente de desenvolvimento.

Evitar dependência direta de ferramentas instaladas manualmente na máquina do desenvolvedor.

Sempre que possível, o ambiente completo deve ser iniciado com:

```bash
docker compose up
```

ou:

```bash
docker compose up -d
```

---

# Docker Compose

Utilizar Docker Compose para orquestrar o ambiente local.

O `docker-compose.yml` deve gerenciar inicialmente:

```text
frontend
gateway
work-items-service
jira-service
salesforce-service
email-service
database
```

Serviços adicionais podem ser incluídos quando necessários:

```text
redis
message-broker
notification-service
observability
```

Não adicionar infraestrutura antes de existir necessidade real.

---

# Dockerfile por projeto

Cada aplicação executável deve possuir seu próprio `Dockerfile`.

Exemplo:

```text
frontend/
└── web/
    └── Dockerfile

backend/
├── gateway/
│   └── Dockerfile
│
├── work-items-service/
│   └── Dockerfile
│
├── jira-service/
│   └── Dockerfile
│
├── salesforce-service/
│   └── Dockerfile
│
└── email-service/
    └── Dockerfile
```

Cada serviço deve conseguir:

```bash
docker build
```

de forma independente.

---

# Ambientes Docker

Preparar a arquitetura para trabalhar com pelo menos:

```text
development
production
```

Quando necessário, utilizar:

```text
docker-compose.yml
docker-compose.override.yml
docker-compose.prod.yml
```

Evitar duplicação excessiva entre arquivos de Compose.

---

# Desenvolvimento com Docker

O fluxo padrão de desenvolvimento deve priorizar Docker.

Exemplo:

```bash
docker compose up -d
```

Para visualizar logs:

```bash
docker compose logs -f
```

Para visualizar um serviço específico:

```bash
docker compose logs -f gateway
```

Para reconstruir:

```bash
docker compose up -d --build
```

Para parar o ambiente:

```bash
docker compose down
```

---

# Hot Reload

O ambiente Docker de desenvolvimento deve suportar hot reload quando tecnicamente viável.

Isso se aplica principalmente a:

* Next.js
* APIs
* microserviços

O desenvolvedor deve conseguir alterar o código sem precisar reconstruir manualmente a imagem a cada modificação.

---

# Volumes

Utilizar volumes apenas quando fizer sentido.

Exemplos:

* desenvolvimento com hot reload
* dados persistentes de banco
* cache de dependências

Evitar montar volumes desnecessariamente.

Nunca sobrescrever dentro do container diretórios importantes de dependências de forma incorreta.

Exemplo de cuidado:

```text
node_modules
.next
dist
build
```

---

# Persistência

Dados persistentes devem utilizar volumes Docker nomeados quando apropriado.

Exemplo:

```text
PostgreSQL
    |
    v
Docker Volume
```

Executar:

```bash
docker compose down
```

não deve apagar os dados locais por padrão.

A exclusão dos volumes deve ser uma ação explícita.

---

# Rede

Os containers devem se comunicar utilizando a rede interna do Docker Compose.

Não utilizar `localhost` para comunicação entre containers.

Errado:

```text
http://localhost:3001
```

Correto:

```text
http://work-items-service:3000
```

O nome do serviço definido no Compose deve funcionar como hostname interno.

---

# Exposição de portas

Expor para a máquina host apenas serviços realmente necessários.

Preferencialmente:

```text
Frontend
Gateway
```

Bancos e microserviços internos não precisam ser expostos publicamente sem necessidade.

Exemplo:

```text
Browser
   |
   v
localhost:3000
Frontend
   |
   v
Docker network
   |
   v
Gateway
   |
   +-----------------------+
   |           |           |
   v           v           v
Work Items    Jira      Salesforce
```

---

# Health Checks

Serviços importantes devem possuir health check quando possível.

Exemplos:

```text
GET /health
GET /health/ready
```

O Docker Compose pode utilizar esses endpoints para verificar disponibilidade.

Não depender apenas do fato de o processo estar executando.

---

# Dependências entre containers

Evitar considerar `depends_on` como garantia de que uma aplicação já está pronta para receber requests.

Quando necessário:

* health checks
* retry controlado
* readiness

devem ser utilizados.

---

# Configurações

Configurações devem ser fornecidas através de variáveis de ambiente.

Exemplos:

```text
DATABASE_URL
JIRA_BASE_URL
JIRA_CLIENT_ID
SALESFORCE_CLIENT_ID
EMAIL_PROVIDER
```

Não colocar configurações específicas de ambiente diretamente no código.

---

# Secrets

Nunca adicionar secrets ao:

```text
Dockerfile
docker-compose.yml
Git
código fonte
```

Exemplos de secrets:

* senha
* client secret
* access token
* refresh token
* API key
* certificado privado

Para desenvolvimento local, utilizar `.env`.

Exemplo:

```text
.env
.env.example
```

`.env` não deve ser versionado.

`.env.example` pode ser versionado contendo apenas nomes e exemplos seguros.

---

# Docker e segurança

Containers devem executar com o menor nível de privilégio possível.

Quando tecnicamente viável:

* utilizar usuário não-root
* evitar `privileged`
* evitar montar Docker socket
* evitar capabilities desnecessárias

Não adicionar permissões elevadas apenas para contornar problemas de configuração.

---

# Imagens Docker

Preferir imagens:

* oficiais
* pequenas
* mantidas
* com versão explícita

Evitar:

```dockerfile
FROM node:latest
```

Preferir versões definidas.

Exemplo:

```dockerfile
FROM node:22-alpine
```

Não depender de `latest` em produção.

---

# Multi-stage builds

Utilizar multi-stage builds em imagens de produção quando fizer sentido.

Exemplo conceitual:

```text
dependencies
     |
     v
build
     |
     v
runtime
```

A imagem final deve conter somente o necessário para executar a aplicação.

Evitar incluir:

* código de desenvolvimento desnecessário
* caches
* ferramentas de build
* dependências dev

na imagem final.

---

# .dockerignore

Todo projeto com `Dockerfile` deve possuir `.dockerignore`.

Incluir quando aplicável:

```text
node_modules
.git
.next
dist
coverage
.env
*.log
```

Evitar enviar arquivos desnecessários para o contexto de build.

---

# Stack Frontend

Utilizar preferencialmente:

* Next.js
* React
* TypeScript
* Mantine
* Mantine UI
* Mantine Hooks
* Mantine Notifications
* Mantine Charts quando necessário
* Tabler Icons

Evitar adicionar novas bibliotecas se o Mantine já fornecer uma solução adequada.

Antes de instalar uma dependência, verificar se:

1. O Mantine já possui o componente.
2. React ou Next.js já resolvem nativamente.
3. A dependência realmente reduz complexidade.

---

# Stack Backend

O backend será baseado em microserviços.

Cada microserviço deve possuir responsabilidade clara e bem delimitada.

Independentemente da linguagem ou framework utilizado, todos os serviços devem seguir os princípios definidos neste documento.

A implementação deve favorecer:

* baixo acoplamento
* alta coesão
* testabilidade
* isolamento de integrações externas
* contratos explícitos
* independência entre serviços

---

# Clean Architecture

Todos os projetos devem seguir Clean Architecture.

Isso inclui:

* frontend
* gateway
* microserviços
* integrações

A regra principal é:

> Dependências devem apontar para dentro.

Camadas externas podem depender das camadas internas.

Camadas internas nunca devem conhecer detalhes de infraestrutura.

Estrutura conceitual:

```text
Infrastructure
      |
      v
Interface Adapters
      |
      v
Application
      |
      v
Domain
```

---

# Camadas Backend

Cada microserviço deve possuir, no mínimo, as seguintes camadas:

```text
src/
├── domain/
├── application/
├── infrastructure/
└── interfaces/
```

Pode haver adaptações de nomenclatura dependendo da linguagem, mas os limites arquiteturais devem ser preservados.

---

# Domain

A camada `domain` contém regras de negócio puras.

Pode conter:

* Entities
* Value Objects
* Domain Services
* Domain Events
* Enums
* Exceptions de domínio
* Regras de negócio

Exemplo:

```text
domain/
├── entities/
├── value-objects/
├── services/
├── events/
└── exceptions/
```

A camada de domínio não deve depender de:

* banco de dados
* HTTP
* Jira
* Salesforce
* framework
* ORM
* filas
* cache
* serviços externos

O domínio deve funcionar independentemente de qualquer infraestrutura.

---

# Application

A camada `application` contém os casos de uso da aplicação.

Exemplo:

```text
application/
├── use-cases/
├── ports/
├── dto/
└── services/
```

Exemplos de casos de uso:

```text
GetUserWorkQueue
GetWorkItemDetails
AssignWorkItem
SynchronizeJiraIssues
SynchronizeSalesforceTickets
SynchronizeEmails
UpdateWorkItemPriority
```

Use cases devem coordenar regras de domínio e dependências externas através de interfaces.

Nunca acessar diretamente banco, API externa ou framework dentro de um use case.

---

# Ports

Dependências externas devem ser representadas através de interfaces.

Exemplo:

```ts
interface WorkItemRepository {
  findById(id: string): Promise<WorkItem | null>;
  save(item: WorkItem): Promise<void>;
}
```

Outro exemplo:

```ts
interface JiraGateway {
  getIssues(userId: string): Promise<JiraIssue[]>;
}
```

A aplicação conhece a interface.

A infraestrutura implementa a interface.

---

# Infrastructure

A camada `infrastructure` contém detalhes técnicos.

Pode conter:

* banco de dados
* ORM
* clientes HTTP
* cache
* Redis
* filas
* Jira API
* Salesforce API
* Microsoft Graph
* Gmail API
* logs
* autenticação externa

Exemplo:

```text
infrastructure/
├── persistence/
├── http/
├── jira/
├── salesforce/
├── email/
├── cache/
├── queue/
└── logging/
```

A infraestrutura nunca deve conter regras de negócio importantes.

---

# Interfaces

A camada `interfaces` representa pontos de entrada do serviço.

Exemplos:

```text
interfaces/
├── http/
├── consumers/
└── jobs/
```

Pode conter:

* controllers
* routes
* presenters
* handlers
* consumers de fila
* jobs

Controllers devem ser pequenos.

Responsabilidades do controller:

1. receber request
2. validar entrada
3. executar use case
4. transformar resposta

Não colocar regra de negócio em controllers.

---

# Exemplo de fluxo

Um request deve seguir aproximadamente:

```text
HTTP Request
     |
     v
Controller
     |
     v
Use Case
     |
     v
Domain
     |
     v
Repository Interface
     |
     v
Repository Implementation
     |
     v
Database
```

Para serviços externos:

```text
Use Case
   |
   v
JiraGateway Interface
   |
   v
JiraApiAdapter
   |
   v
Jira API
```

---

# Microserviços

Cada microserviço deve possuir uma responsabilidade clara.

Evitar criar serviços excessivamente pequenos sem necessidade.

A separação deve seguir domínios e responsabilidades reais.

---

# Gateway / BFF

Criar um serviço de entrada para o frontend.

Responsabilidades:

* autenticação
* autorização
* roteamento
* agregação de dados quando necessário
* padronização de respostas
* proteção das APIs internas

Exemplo:

```text
backend/gateway/
```

O frontend deve se comunicar principalmente com o Gateway/BFF.

Não expor microserviços diretamente ao navegador sem necessidade.

---

# Work Items Service

O `work-items-service` será um dos serviços centrais.

Responsável pelo modelo unificado de trabalho.

Ele deve representar itens vindos de diferentes fontes.

Exemplos:

* Jira SP
* Salesforce Ticket
* E-mail

Modelo conceitual:

```ts
type WorkItemSource =
  | 'jira'
  | 'salesforce'
  | 'email';

type WorkItem = {
  id: string;
  externalId: string;
  source: WorkItemSource;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assignee?: string;
  customer?: string;
  createdAt: string;
  updatedAt: string;
  dueAt?: string;
  externalUrl?: string;
};
```

Esse modelo deve pertencer ao domínio interno da aplicação.

Não usar diretamente modelos do Jira, Salesforce ou Gmail na aplicação central.

---

# Jira Service

Responsável exclusivamente pela integração com Jira.

Exemplos de responsabilidades:

* autenticação
* buscar issues
* buscar SPs
* buscar comentários
* sincronizar status
* adicionar comentários quando permitido
* atualizar itens quando necessário

Estrutura sugerida:

```text
jira-service/
└── src/
    ├── domain/
    ├── application/
    ├── infrastructure/
    └── interfaces/
```

O serviço deve converter os dados externos para contratos internos.

---

# Salesforce Service

Responsável pela integração com Salesforce.

Exemplos:

* buscar tickets
* buscar casos
* consultar responsável
* consultar status
* adicionar respostas
* atualizar dados quando permitido

Não permitir que detalhes do Salesforce contaminem outros serviços.

---

# Email Service

Responsável por integrações de e-mail.

Pode suportar posteriormente:

* Microsoft Graph
* Gmail

Responsabilidades possíveis:

* buscar mensagens
* buscar threads
* detectar mensagens não respondidas
* identificar remetente
* sincronizar mensagens relevantes
* responder e-mails quando permitido

Cada provedor deve possuir seu próprio adapter.

Exemplo:

```text
email-service/
└── src/
    └── infrastructure/
        └── providers/
            ├── microsoft/
            └── gmail/
```

---

# Notification Service

Pode ser criado quando necessário.

Responsável por:

* alertas
* SLA próximo do vencimento
* item atualizado
* novo ticket
* nova resposta
* notificações internas

Não criar esse serviço antes de existir uma necessidade concreta.

---

# Comunicação entre microserviços

Não permitir imports diretos de código de outro microserviço.

Errado:

```text
work-items-service
    ↓
import ../jira-service/repository
```

Correto:

```text
work-items-service
    ↓
HTTP / Message Broker
    ↓
jira-service
```

Os serviços devem conversar por:

* HTTP
* eventos
* filas

Escolher o mecanismo mais simples para cada caso.

---

# Comunicação síncrona

Utilizar HTTP quando a operação precisa de resposta imediata.

Exemplos:

```text
Frontend
   ↓
Gateway
   ↓
Work Items Service
```

Ou:

```text
Gateway
   ↓
Salesforce Service
```

---

# Comunicação assíncrona

Utilizar eventos quando um serviço não precisa esperar o outro terminar.

Exemplos:

```text
Salesforce sincronizado
        |
        v
TicketUpdated
        |
        v
Work Items Service
```

Outro exemplo:

```text
JiraIssueUpdated
       |
       v
Work Items Service
```

Não adicionar broker ou arquitetura orientada a eventos sem necessidade real.

Começar simples.

Evoluir quando existir benefício operacional.

---

# Eventos

Eventos devem representar fatos já ocorridos.

Preferir nomes no passado.

Exemplos:

```text
JiraIssueUpdated
SalesforceTicketCreated
SalesforceTicketUpdated
EmailReceived
WorkItemAssigned
WorkItemCompleted
```

Evitar eventos genéricos como:

```text
DataChanged
ProcessSomething
UpdateEvent
```

---

# Contratos

Contratos entre serviços devem ser explícitos.

Evitar compartilhar entidades internas.

Criar DTOs específicos para comunicação.

Exemplo:

```ts
type SalesforceTicketUpdatedEvent = {
  ticketId: string;
  title: string;
  status: string;
  assigneeId?: string;
  updatedAt: string;
};
```

---

# Shared Contracts

Se houver necessidade real, utilizar:

```text
packages/shared-contracts/
```

Esse projeto pode conter:

* contratos HTTP
* DTOs públicos
* eventos
* enums compartilhados

Não colocar:

* regras de negócio
* repositories
* services
* entidades de domínio

dentro de `shared-contracts`.

Evitar transformar `shared-contracts` em uma biblioteca gigante usada por tudo.

---

# Banco de dados

Cada microserviço deve ser dono dos próprios dados.

Preferir:

```text
Work Items Service
   ↓
Work Items Database

Jira Service
   ↓
Jira Integration Database

Salesforce Service
   ↓
Salesforce Integration Database
```

Evitar múltiplos serviços acessando as mesmas tabelas diretamente.

Regra:

> Um serviço nunca deve acessar diretamente o banco de outro serviço.

A comunicação deve ocorrer pela API ou por eventos.

---

# Repository Pattern

Persistência deve ser abstraída.

Exemplo:

```text
Domain/Application
       |
       v
WorkItemRepository
       |
       v
PostgresWorkItemRepository
```

O domínio não deve saber se os dados estão em:

* PostgreSQL
* MySQL
* MongoDB
* memória
* arquivo

---

# Autenticação

A autenticação deve ser centralizada preferencialmente no Gateway.

Depois da autenticação, os serviços internos devem receber apenas informações necessárias.

Exemplo:

```text
userId
roles
permissions
```

Nunca confiar em dados enviados diretamente pelo frontend sem validação.

---

# Autorização

O sistema deve estar preparado para permissões.

Exemplos:

* colaborador
* líder
* administrador

Possíveis permissões:

```text
work-items.read
work-items.update
jira.read
jira.comment
salesforce.read
salesforce.respond
email.read
email.respond
metrics.read
```

Evitar regras de autorização espalhadas pelo código.

---

# Observabilidade

Todos os serviços devem possuir logs estruturados.

Sempre que possível incluir:

```text
requestId
correlationId
userId
service
operation
externalSystem
```

Um request deve poder ser rastreado entre múltiplos serviços.

Exemplo:

```text
Frontend
   ↓ correlationId=abc123

Gateway
   ↓ correlationId=abc123

Work Items Service
   ↓ correlationId=abc123

Salesforce Service
```

---

# Erros

Separar erros de:

* domínio
* aplicação
* infraestrutura
* integração externa

Não retornar erros técnicos diretamente para o frontend.

Exemplo interno:

```text
SalesforceApiTimeoutException
```

Resposta externa:

```json
{
  "code": "SALESFORCE_UNAVAILABLE",
  "message": "Não foi possível carregar os tickets do Salesforce."
}
```

---

# Retry

Retries devem ser usados apenas em operações idempotentes ou quando a estratégia for segura.

Nunca repetir automaticamente operações que possam causar:

* respostas duplicadas
* comentários duplicados
* alterações duplicadas
* criação duplicada de registros

---

# Idempotência

Operações sensíveis devem considerar idempotência.

Principalmente:

* criação
* sincronização
* processamento de eventos
* envio de mensagens
* respostas

---

# Timeouts

Toda chamada externa deve possuir timeout.

Nunca deixar requests para:

* Jira
* Salesforce
* e-mail

aguardando indefinidamente.

---

# Frontend e Clean Architecture

O frontend também deve respeitar separação de responsabilidades.

Estrutura sugerida:

```text
frontend/web/src/
├── domain/
├── application/
├── infrastructure/
├── presentation/
└── shared/
```

---

# Domain Frontend

Pode conter modelos e regras independentes de React.

Exemplo:

```text
domain/
├── entities/
├── value-objects/
└── types/
```

Não importar:

```text
React
Mantine
Next.js
Axios
```

na camada de domínio.

---

# Application Frontend

Contém casos de uso e regras da aplicação.

Exemplos:

```text
GetWorkQueue
FilterWorkItems
SortWorkItems
GetDashboardMetrics
```

---

# Infrastructure Frontend

Contém detalhes externos.

Exemplos:

```text
infrastructure/
├── api/
├── repositories/
├── storage/
└── auth/
```

Aqui podem existir implementações como:

```text
HttpWorkItemRepository
LocalStoragePreferencesRepository
```

---

# Presentation

A camada `presentation` contém React, Next.js e Mantine.

Exemplo:

```text
presentation/
├── components/
├── pages/
├── hooks/
├── layouts/
└── providers/
```

Componentes visuais não devem conter regras de negócio complexas.

---

# Fluxo Frontend

Preferir:

```text
Component
   |
   v
Hook / Use Case
   |
   v
Repository Interface
   |
   v
HTTP Repository
   |
   v
Backend API
```

Evitar:

```text
Component
   |
   v
fetch('/api/...')
```

espalhado por diversos componentes.

---

# Princípio principal do produto

Não recriar Jira, Salesforce ou cliente de e-mail.

O dashboard deve exibir as informações importantes e permitir as ações mais frequentes.

Para operações complexas, oferecer acesso direto ao item na ferramenta original.

Exemplos:

* Abrir no Jira
* Abrir no Salesforce
* Abrir e-mail original

---

# Conceito principal: Minha Fila

A tela mais importante da aplicação deve ser `Minha Fila`.

Ela deve combinar itens de diferentes fontes em uma lista única.

Exemplo:

* SP do Jira
* Ticket do Salesforce
* E-mail que precisa de resposta

Cada item deve possuir, quando disponível:

* origem
* identificador
* título
* descrição resumida
* cliente
* responsável
* prioridade
* status
* SLA
* tempo parado
* data da última atualização
* tipo do item
* URL da ferramenta original

Não tratar Jira, Salesforce e E-mail como três sistemas isolados dentro da aplicação.

A experiência principal deve ser uma fila unificada.

---

# Navegação Frontend

A navegação principal pode seguir:

* Início
* Minha Fila
* Jira
* Salesforce
* E-mails
* Métricas
* Configurações

A sidebar deve ser simples e objetiva.

Sempre que possível, mostrar contadores:

* Minha Fila `12`
* Jira `4`
* Salesforce `7`
* E-mails `3`

---

# Dashboard inicial

O dashboard deve mostrar rapidamente a situação atual do colaborador.

Priorizar informações como:

* itens pendentes
* itens urgentes
* tickets próximos do SLA
* SPs abertas
* novas respostas
* itens aguardando ação
* itens concluídos hoje

Evitar dashboards com gráficos sem utilidade operacional.

Gráficos devem existir somente quando ajudarem a tomar uma decisão ou entender desempenho.

---

# UI

A interface deve ser:

* clara
* moderna
* limpa
* objetiva
* fácil de escanear visualmente
* colorida sem ficar poluída

Usar fundo claro como padrão.

Preferir:

* fundo geral levemente acinzentado
* cards brancos
* textos escuros
* cores intensas em estados, indicadores e ações

Não criar uma interface predominantemente cinza ou com aparência de sistema administrativo antigo.

---

# Cores

As cores devem comunicar estado.

Exemplo conceitual:

* azul: novo
* roxo: em andamento
* amarelo/laranja: aguardando
* vermelho: urgente, erro ou SLA crítico
* verde: resolvido ou concluído

A cor da origem não deve substituir a cor do status.

Um ticket do Salesforce urgente continua usando vermelho como destaque de urgência.

A origem Salesforce pode ser representada por:

* ícone
* badge secundário
* pequena marca visual

---

# Origem dos itens

Sempre deixar claro de onde o item veio.

Exemplos:

* Jira
* Salesforce
* E-mail

Usar componentes pequenos como:

* Badge
* ThemeIcon
* ícone
* texto secundário

Evitar ocupar espaço excessivo com a origem.

---

# Prioridade visual

A interface deve permitir identificar rapidamente:

1. O que está crítico.
2. O que precisa ser feito agora.
3. O que está esperando terceiros.
4. O que já foi concluído.

Informações menos importantes devem possuir menor peso visual.

Não destacar tudo ao mesmo tempo.

---

# Componentes Mantine

Priorizar componentes nativos do Mantine.

## Layout

* AppShell
* Stack
* Group
* Flex
* Grid
* SimpleGrid
* Container

## Navegação

* NavLink
* Tabs
* Breadcrumbs
* Menu

## Dados

* Table
* Badge
* Avatar
* Text
* Tooltip
* Progress
* Indicator

## Interação

* Button
* ActionIcon
* Modal
* Drawer
* Popover
* Menu

## Formulários

* TextInput
* Select
* MultiSelect
* Checkbox
* SegmentedControl
* DatePicker

## Feedback

* Notification
* Alert
* Loader
* Skeleton

Evitar recriar manualmente componentes que já existem no Mantine.

---

# Tabelas e filas

As listas de tickets e SPs devem ser pensadas para uso intensivo.

Devem suportar futuramente:

* busca
* filtros
* ordenação
* paginação
* seleção
* filtros por responsável
* filtros por origem
* filtros por status
* filtros por prioridade
* filtros por SLA

Não adicionar todos esses recursos de uma vez se ainda não forem necessários.

Construir de forma que seja fácil evoluir depois.

---

# Responsividade

A interface deve funcionar bem principalmente em desktop.

Desktop é a prioridade do projeto.

Ainda assim:

* evitar larguras fixas desnecessárias
* permitir telas menores
* sidebar deve conseguir recolher
* tabelas podem usar scroll horizontal quando necessário

---

# Segurança

Nunca armazenar no frontend:

* client secret
* access token de integração
* refresh token
* senha
* credencial de serviço
* certificado privado

Segredos devem existir apenas no backend.

Usar variáveis de ambiente e mecanismos seguros de secrets management.

---

# Testes

Clean Architecture deve permitir testar regras sem infraestrutura real.

Priorizar testes de:

1. domínio
2. use cases
3. adapters importantes
4. integrações críticas

Use cases devem poder ser testados usando repositories e gateways fake.

---

# Docker em testes

Os testes de integração devem poder subir dependências através do Docker quando necessário.

Exemplos:

```text
PostgreSQL
Redis
Message Broker
```

Testes unitários não devem depender de Docker.

Separar claramente:

```text
Unit Tests
Integration Tests
End-to-End Tests
```

---

# CI/CD

A arquitetura deve estar preparada para CI/CD baseado em containers.

O pipeline deve conseguir:

```text
lint
test
build
docker build
```

Cada microserviço deve poder ser validado e gerar sua própria imagem de forma independente.

Não exigir build completo de todos os serviços quando apenas um serviço for alterado, se a infraestrutura de CI permitir evitar isso.

---

# Nomenclatura

Código deve utilizar nomes em inglês.

Exemplos:

```text
WorkItem
TicketList
SlaBadge
PriorityBadge
GetWorkQueue
WorkItemRepository
SalesforceGateway
JiraApiAdapter
```

Textos exibidos ao usuário podem estar em português.

---

# Código

Priorizar código simples e legível.

Evitar:

* abstração excessiva
* patterns complexos sem necessidade
* funções gigantes
* componentes gigantes
* arquivos com múltiplas responsabilidades
* serviços com múltiplos domínios

Se uma solução simples resolve o problema, preferir a solução simples.

---

# Evitar overengineering

Clean Architecture não significa criar dezenas de abstrações para funcionalidades simples.

Criar abstrações principalmente nas fronteiras:

* banco de dados
* APIs externas
* filas
* cache
* filesystem
* serviços externos

Microserviços também não significam adicionar infraestrutura desnecessária.

Não adicionar Redis, Kafka, RabbitMQ, Kubernetes ou similares apenas porque o projeto utiliza microserviços.

Começar com Docker Compose e comunicação simples.

Evoluir quando houver necessidade real.

---

# Objetivo do MVP

O primeiro MVP deve conseguir:

1. Exibir dashboard do colaborador.
2. Exibir fila unificada.
3. Diferenciar Jira, Salesforce e E-mail.
4. Mostrar prioridade e status.
5. Mostrar tempo ou SLA quando disponível.
6. Filtrar itens.
7. Abrir registro na ferramenta original.
8. Sincronizar dados através dos microserviços.
9. Executar todo o ambiente local através de Docker Compose.

---

# Ordem sugerida de desenvolvimento

## Fase 1 — Estrutura

Criar:

```text
frontend/
backend/
packages/
docker/
docs/
docker-compose.yml
```

Definir padrões de:

* Clean Architecture
* Docker
* variáveis de ambiente
* comunicação entre serviços

---

## Fase 2 — Frontend

Criar:

* Next.js
* Mantine
* AppShell
* sidebar
* header
* dashboard inicial
* Dockerfile

Utilizar mocks.

---

## Fase 3 — Domínio central

Criar:

```text
work-items-service
```

Definir:

* WorkItem
* WorkItemSource
* WorkItemStatus
* Priority
* SLA
* casos de uso
* Dockerfile

---

## Fase 4 — Gateway

Criar o Gateway/BFF.

O frontend deve começar a consumir apenas o Gateway.

Criar também seu `Dockerfile`.

---

## Fase 5 — Docker Compose

Integrar:

```text
frontend
gateway
work-items-service
```

O ambiente inicial deve subir com:

```bash
docker compose up -d
```

---

## Fase 6 — Jira

Criar:

```text
jira-service
```

Implementar leitura e sincronização inicial.

Adicionar o serviço ao Docker Compose.

---

## Fase 7 — Salesforce

Criar:

```text
salesforce-service
```

Implementar leitura e sincronização inicial.

Adicionar ao Docker Compose.

---

## Fase 8 — E-mail

Criar:

```text
email-service
```

Implementar leitura e sincronização inicial.

Adicionar ao Docker Compose.

---

## Fase 9 — Fila unificada

Conectar os serviços ao `work-items-service`.

Exibir no frontend:

```text
Minha Fila
```

com dados reais.

---

## Fase 10 — Infraestrutura

Adicionar somente quando necessário:

```text
PostgreSQL
Redis
Message Broker
```

Todos devem ser gerenciados pelo Docker Compose no ambiente de desenvolvimento.

---

## Fase 11 — Filtros e SLA

Adicionar:

* filtros
* busca
* prioridade
* ordenação
* SLA

---

## Fase 12 — Métricas

Adicionar somente métricas úteis ao fluxo operacional.

---

## Fase 13 — Ações

Avaliar ações que realmente valem ser executadas no dashboard.

Exemplos:

* responder ticket
* comentar SP
* responder e-mail
* alterar responsável
* alterar status

---

# Regra final de arquitetura

Antes de implementar uma funcionalidade, responder:

```text
Qual serviço é responsável por isso?

Qual é a regra de negócio?

Qual é o use case?

Qual dependência externa será abstraída?

Essa camada realmente deveria conhecer essa dependência?
```

Se uma camada de domínio ou aplicação estiver importando SDK de Jira, Salesforce, banco, HTTP ou framework, a arquitetura provavelmente está errada.

---

# Regra final de infraestrutura

Todo novo serviço executável deve responder também:

```text
Ele possui Dockerfile?

Ele está configurado no Docker Compose?

As variáveis estão documentadas no .env.example?

Ele consegue comunicar com os demais serviços pela rede Docker?

Ele possui health check quando necessário?

Ele consegue ser iniciado sem instalação manual adicional na máquina?
```

O ambiente de desenvolvimento não deve depender de configurações manuais específicas da máquina do desenvolvedor.

A experiência desejada é:

```bash
git clone ...
cp .env.example .env
docker compose up -d --build
```

e o ambiente estar pronto para desenvolvimento.

---

# Regra final de produto

Sempre avaliar uma nova funcionalidade perguntando:

> Isso ajuda o colaborador a encontrar ou executar o próximo trabalho mais rapidamente?

Se a resposta for não, avaliar se a funcionalidade realmente pertence a este projeto.
