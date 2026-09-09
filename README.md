# Tech Challenge 3 — Blog Acadêmico

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-149ECA?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Chakra UI](https://img.shields.io/badge/Chakra%20UI-3.37-319795?logo=chakraui)](https://chakra-ui.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma)](https://www.prisma.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)](https://www.mongodb.com)

Interface web para a plataforma de blogging acadêmico do Tech Challenge, construída sobre a API REST já existente. Permite que professores(as) publiquem conteúdo e que estudantes naveguem, pesquisem e leiam os posts.

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Objetivo](#objetivo)
- [Funcionalidades](#funcionalidades)
- [Arquitetura e estrutura de pastas](#arquitetura-e-estrutura-de-pastas)
- [Modelo de dados](#modelo-de-dados)
- [Dependências principais](#dependências-principais)
- [Como instalar e rodar](#como-instalar-e-rodar)
- [Telas](#telas)
- [Endpoints (API Reference)](#endpoints-api-reference)
- [Roadmap / Melhorias futuras](#roadmap--melhorias-futuras)

## Sobre o projeto

Este repositório é a etapa de **front-end** de uma aplicação de blogging construída em fases anteriores do desafio, que já entregaram o modelo de dados e os endpoints REST para posts e autores(as). Aqui o foco é a camada de apresentação: uma interface gráfica em React (via Next.js App Router) consumindo essa API através de Server Actions e Route Handlers, com Chakra UI para os componentes visuais e MongoDB (via Prisma) como banco de dados.

## Objetivo

> Chegou a hora de criarmos uma interface gráfica robusta, intuitiva e eficiente para esta aplicação. Este desafio focará em desenvolver o front-end, proporcionando uma experiência de usuário excelente tanto para professores(as) quanto para estudantes.

O objetivo é desenvolver uma interface gráfica para a aplicação de blogging utilizando React. A aplicação deve ser responsiva, acessível e fácil de usar, permitindo aos(às) docentes e estudantes interagir com os diversos endpoints REST já implementados no back-end.

## Funcionalidades

- **Listagem de posts** — todos os posts cadastrados, exibindo título e um resumo do conteúdo.
- **Filtro por professor(a)** — seletor com a lista de autores(as) para restringir os posts exibidos a um único professor.
- **Busca por palavra-chave** — campo de texto que filtra posts pelo conteúdo do título ou do corpo do texto.
- **Detalhe do post** — página dedicada com o conteúdo completo e o nome do(a) professor(a) responsável.
- **Tema claro/escuro** — alternância de tema persistida entre sessões, com suporte à preferência do sistema operacional.

## Arquitetura e estrutura de pastas

A aplicação usa o **App Router** do Next.js. A busca de dados para renderização de página acontece via **Server Actions** (`src/actions`), enquanto a API REST consumida por integrações externas vive em **Route Handlers** (`src/app/api`) — ambas as camadas compartilham o mesmo cliente Prisma.

```
src/
├── actions/            # Server Actions — leitura de dados para as páginas (Server Components)
│   ├── author.ts       #   getAllAuthors()
│   └── post.ts         #   getAllPosts(), getPostId() + tipo PostWithAuthor
│
├── app/
│   ├── api/             # API REST (Route Handlers) — GET, POST, PUT, DELETE
│   │   ├── author/
│   │   │   ├── route.ts        # GET (lista) · POST (cria)
│   │   │   └── [id]/route.ts   # GET · PUT · DELETE (por id)
│   │   └── post/
│   │       ├── route.ts        # GET (lista) · POST (cria)
│   │       └── [id]/route.ts   # GET · PUT · DELETE (por id)
│   │
│   ├── [post]/          # Rota dinâmica /:id — página de detalhe do post
│   │   ├── page.tsx
│   │   └── ui/ViewPost.tsx
│   │
│   ├── ui/              # Componentes de UI da página inicial
│   │   ├── ListPost.tsx     # Lista + filtro por autor + busca por palavra-chave
│   │   └── TitlePage.tsx
│   │
│   ├── layout.tsx       # Layout raiz (fonte, Provider de tema/UI)
│   └── page.tsx         # Página inicial (/) — lista de posts
│
├── components/ui/       # Snippets do Chakra UI (provider, color-mode, tooltip, toaster)
│
└── lib/
    └── prisma.ts        # Instância única do PrismaClient (+ namespace Prisma)

prisma/
└── schema.prisma        # Modelos Post e Author (MongoDB)
```

Fluxo de dados:

```
Página (Server Component)  →  Server Action (src/actions)  →  Prisma Client  →  MongoDB
Consumidor externo/API      →  Route Handler (src/app/api)  →  Prisma Client  →  MongoDB
```

## Modelo de dados

```prisma
model Post {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  title     String
  text      String
  authors   Author   @relation(fields: [authorId], references: [id])
  authorId  String   @db.ObjectId
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Author {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Um `Author` possui vários `Post`s (relação um-para-muitos); cada `Post` referencia exatamente um `Author` através de `authorId`.

## Dependências principais

| Pacote | Versão | Uso no projeto |
| --- | --- | --- |
| [next](https://nextjs.org) | 16.3.4 | Framework — App Router, Server Actions, Route Handlers |
| [react](https://react.dev) / react-dom | 19.2.8 | Biblioteca de UI |
| [typescript](https://www.typescriptlang.org) | ^5 | Tipagem estática |
| [prisma](https://www.prisma.io) / @prisma/client | 6.19 | ORM e cliente de acesso ao MongoDB |
| [@chakra-ui/react](https://chakra-ui.com) | ^3.37.0 | Biblioteca de componentes de UI |
| [@emotion/react](https://emotion.sh) | ^11.14.0 | Motor de estilos (CSS-in-JS) usado internamente pelo Chakra UI |
| [next-themes](https://github.com/pacocoursey/next-themes) | ^0.4.6 | Alternância e persistência do tema claro/escuro |
| [react-icons](https://react-icons.github.io/react-icons) | ^5.7.0 | Ícones usados na interface |
| [@react-icons/all-files](https://www.npmjs.com/package/@react-icons/all-files) | ^4.1.0 | Conjunto adicional de ícones (instalado, ainda não utilizado no código) |
| [dotenv](https://github.com/motdotla/dotenv) | ^17.4.2 | Carregamento de variáveis de ambiente (`DATABASE_URL`) |
| [eslint](https://eslint.org) / eslint-config-next | ^9 / 16.3.4 | Padronização e lint do código |
| [babel-plugin-react-compiler](https://react.dev/learn/react-compiler) | 1.0.0 | React Compiler, habilitado em `next.config.ts` |

## Como instalar e rodar

**Pré-requisitos**

- [Node.js](https://nodejs.org) 20 ou superior
- Uma instância do MongoDB acessível (local ou [Atlas](https://www.mongodb.com/atlas))

**Passo a passo**

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd techchallenge-3

# 2. Instalar as dependências
npm install

# 3. Configurar as variáveis de ambiente
# crie um arquivo .env na raiz do projeto com:
echo "DATABASE_URL=<sua-connection-string-do-mongodb>" > .env

# 4. Gerar o cliente Prisma
npx prisma generate

# 5. Rodar o servidor de desenvolvimento
npm run dev
```

A aplicação fica disponível em [http://localhost:3000](http://localhost:3000).

**Outros scripts disponíveis**

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Sobe o servidor de desenvolvimento (Turbopack) |
| `npm run build` | Gera o build de produção |
| `npm run start` | Sobe o servidor a partir do build de produção |
| `npm run lint` | Executa o ESLint no projeto |

## Telas

### Página inicial (`/`)

Lista todos os posts cadastrados, cada um exibindo título e um resumo do texto; ao clicar em um post, o(a) usuário(a) é levado(a) à página de detalhe. No topo da lista há dois controles de filtragem:

- um **select** com a lista de professores(as), que restringe a lista aos posts do(a) autor(a) selecionado(a);
- um **campo de busca** por palavra-chave, que filtra pelos campos de título e texto.

### Detalhe do post (`/:id`)

Exibe o título, o conteúdo completo e o nome do(a) professor(a) responsável pelo post, com um link de retorno para a página inicial. Caso o `id` informado na URL não corresponda a nenhum post existente, o(a) usuário(a) é redirecionado(a) para a página inicial.

## Endpoints (API Reference)

Além das Server Actions internas, o projeto expõe uma API REST em `/api`, consumível por qualquer cliente HTTP.

### Posts — `/api/post`

| Método | Rota | Descrição | Corpo da requisição | Resposta |
| --- | --- | --- | --- | --- |
| `GET` | `/api/post` | Lista todos os posts | — | `200` — array de `Post` |
| `POST` | `/api/post` | Cria um post | `{ "title": string, "text": string, "authorId": string }` | `201` — `{ data, message }` · `400` se faltar campo obrigatório |
| `GET` | `/api/post/:id` | Busca um post pelo id | — | `200` — `Post` · `404` se não encontrado |
| `PUT` | `/api/post/:id` | Atualiza um post | `{ "title": string, "text": string, "authorId"?: string }` | `200` — `{ data, message }` · `400`/`404` |
| `DELETE` | `/api/post/:id` | Remove um post | — | `200` — `{ message }` · `404` se não encontrado |

### Autores — `/api/author`

| Método | Rota | Descrição | Corpo da requisição | Resposta |
| --- | --- | --- | --- | --- |
| `GET` | `/api/author` | Lista todos os autores | — | `200` — array de `Author` |
| `POST` | `/api/author` | Cria um autor | `{ "name": string }` | `201` — `{ data, message }` · `400` se faltar `name` |
| `GET` | `/api/author/:id` | Busca um autor pelo id | — | `200` — `Author` · `404` se não encontrado |
| `PUT` | `/api/author/:id` | Atualiza um autor | `{ "name": string }` | `200` — `{ data, message }` · `400`/`404` |
| `DELETE` | `/api/author/:id` | Remove um autor | — | `200` — `{ message }` · `404` se não encontrado |

**Exemplo — criar um post**

```bash
curl -X POST http://localhost:3000/api/post \
  -H "Content-Type: application/json" \
  -d '{"title": "Aula 1", "text": "Conteúdo da aula", "authorId": "<id-do-autor>"}'
```

```json
{
  "data": {
    "id": "…",
    "title": "Aula 1",
    "text": "Conteúdo da aula",
    "authorId": "…",
    "createdAt": "…",
    "updatedAt": "…"
  },
  "message": "Post cadastrado com sucesso!"
}
```

## Roadmap / Melhorias futuras

- [ ] Telas de criação, edição e exclusão de posts e autores diretamente pela interface (hoje essas operações só existem via API).
- [ ] Notificações de feedback com o componente `Toaster` (já disponível em `src/components/ui/toaster.tsx`, ainda não conectado às ações da aplicação).
- [ ] Paginação (ou scroll infinito) na listagem de posts.
- [ ] Autenticação e autorização, distinguindo sessões de professor(a) e de estudante.
- [ ] Testes automatizados (unitários para Server Actions/Route Handlers e end-to-end para os fluxos de navegação).
- [ ] Estados de carregamento e de erro explícitos nas páginas que buscam dados assíncronos.
