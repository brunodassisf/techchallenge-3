# Tech Challenge 3 — Blog Acadêmico

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-149ECA?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Chakra UI](https://img.shields.io/badge/Chakra%20UI-3.37-319795?logo=chakraui)](https://chakra-ui.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma)](https://www.prisma.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)](https://www.mongodb.com)

Plataforma de blogging acadêmico full-stack construída em Next.js. Possui autenticação própria com três papéis de usuário (administrador, professor(a) e estudante), área administrativa para cadastro de professores(as), área do(a) professor(a) para publicar e gerenciar seus próprios posts, e uma página inicial pública onde qualquer visitante pode navegar, pesquisar e ler os posts.

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Objetivo](#objetivo)
- [Funcionalidades](#funcionalidades)
- [Arquitetura e estrutura de pastas](#arquitetura-e-estrutura-de-pastas)
- [Autenticação e autorização](#autenticação-e-autorização)
- [Modelo de dados](#modelo-de-dados)
- [Dependências principais](#dependências-principais)
- [Como instalar e rodar](#como-instalar-e-rodar)
- [Telas](#telas)
- [Endpoints (API Reference)](#endpoints-api-reference)
- [Roadmap / Melhorias futuras](#roadmap--melhorias-futuras)

## Sobre o projeto

Este repositório entrega tanto o back-end quanto o front-end da aplicação de blogging: modelo de dados, API REST, autenticação/sessão e a interface gráfica em React (via Next.js App Router), com Chakra UI para os componentes visuais, MongoDB (via Prisma) como banco de dados e uma sessão própria baseada em JWT (sem depender de um provedor externo de autenticação). O front-end não acessa o Prisma diretamente para servir as páginas: toda leitura e escrita de dados passa pelos mesmos Route Handlers REST expostos em `/api`, seja a partir de Server Components (via Server Actions) ou de Client Components (via `fetch` + TanStack Query).

## Objetivo

> Chegou a hora de criarmos uma interface gráfica robusta, intuitiva e eficiente para esta aplicação. Este desafio focará em desenvolver o front-end, proporcionando uma experiência de usuário excelente tanto para professores(as) quanto para estudantes.

O objetivo é desenvolver uma interface gráfica para a aplicação de blogging utilizando React. A aplicação deve ser responsiva, acessível e fácil de usar, permitindo aos(às) docentes e estudantes interagir com os diversos endpoints REST implementados no back-end — agora com autenticação e autorização por papel, para que cada tipo de usuário(a) tenha acesso apenas às ações que lhe cabem (visitante/estudante consulta conteúdo, professor(a) publica e gerencia seus posts, administrador(a) cadastra professores(as)).

## Funcionalidades

**Público (sem login)**

- **Listagem de posts** — todos os posts cadastrados, exibindo título e um resumo do conteúdo.
- **Filtro por professor(a)** — seletor com a lista de autores(as) para restringir os posts exibidos a um único professor.
- **Busca por palavra-chave** — campo de texto que filtra posts pelo título ou pelo corpo do texto (os dois filtros combinam entre si).
- **Detalhe do post** — página dedicada com o conteúdo completo e o nome do(a) professor(a) responsável.
- **Tema claro/escuro** — alternância de tema persistida entre sessões, com suporte à preferência do sistema operacional.
- **Login/Cadastro** — modal de login com sessão persistida em cookie.

**Administrador(a) (`ADMIN`)**

- Acesso à área `/admin`, com listagem de todos(as) os(as) professores(as) cadastrados(as).
- Cadastro de novos(as) professores(as) (cria simultaneamente a conta de acesso e o perfil de autor).
- Pode editar/excluir qualquer post por meio da API (não há telas dedicadas para isso hoje, ver [Roadmap](#roadmap--melhorias-futuras)).

**Professor(a) (`AUTHOR`)**

- Acesso à área `/area-professor`, com criação de novos posts.
- Listagem apenas dos próprios posts, com edição e exclusão.

## Arquitetura e estrutura de pastas

A aplicação usa o **App Router** do Next.js 16. Toda a busca e a alteração de dados — tanto para renderizar páginas quanto para as interações do usuário — passam pelos **Route Handlers** em `src/app/api`, nunca diretamente pelo Prisma a partir da camada de apresentação (com uma única exceção pontual, apontada abaixo). Existem duas formas de chegar até essa API, dependendo de onde o dado é necessário:

```
src/
├── actions/             # Server Actions — leitura de dados para Server Components
│   ├── author.ts        #   getAuthor() → serverFetch('/api/author')
│   └── post.ts          #   getAllPosts(), getPostId() → serverFetch('/api/post[/:id]')
│
├── services/            # Wrappers de fetch usados por Client Components (react-query)
│   ├── author.ts        #   getAuthors()
│   ├── post.ts          #   getPosts(authorId, search), getPostsByAuthorId(authorId)
│   └── auth.ts          #   (reservado, ainda não implementado)
│
├── lib/
│   ├── prisma.ts        # Instância única do PrismaClient
│   ├── session.ts       # JWT da sessão (jose): encrypt/decrypt, createSession, updateSession, deleteSession
│   ├── dal.ts            # Data Access Layer: verifySession() e getSession()
│   ├── api.ts            # serverFetch() — fetch server-side para a própria API, repassando cookies
│   ├── client-auth.ts    # logout(router) — fetch client-side de logout + navegação
│   └── definition.ts      # Schemas Zod (login, criar autor, criar post) e tipos compartilhados
│
├── hook/
│   └── usePasswordVisibility.tsx  # Hook do botão de mostrar/ocultar senha
│
├── proxy.ts             # Middleware (Next 16) — protege /admin e /area-professor por papel
│
├── app/
│   ├── api/                       # API REST (Route Handlers)
│   │   ├── auth/
│   │   │   ├── login/route.ts     # POST — autentica e cria a sessão
│   │   │   └── logout/route.ts    # POST — encerra a sessão
│   │   ├── author/
│   │   │   ├── route.ts           # GET (lista, pública) · POST (cria, ADMIN)
│   │   │   └── [id]/route.ts      # GET (pública) · PUT · DELETE (ADMIN)
│   │   └── post/
│   │       ├── route.ts           # GET (lista/busca/filtro, pública) · POST (cria, AUTHOR)
│   │       └── [id]/route.ts      # GET (pública) · PUT · DELETE (ADMIN ou autor dono do post)
│   │
│   ├── [post]/                    # Rota dinâmica /:id — detalhe do post (pública)
│   │   ├── page.tsx
│   │   └── ui/ViewPost.tsx
│   │
│   ├── admin/                     # Área do administrador (protegida por role ADMIN)
│   │   ├── page.tsx
│   │   └── ui/ListAuthor.tsx, ModalCreateAuthor.tsx
│   │
│   ├── area-professor/            # Área do professor (protegida por role AUTHOR)
│   │   ├── page.tsx
│   │   └── ui/ListPostsAuthor.tsx, ModalCreatePost.tsx, ModalEditPost.tsx
│   │
│   ├── ui/                        # Componentes da página inicial e do cabeçalho
│   │   ├── ListPost.tsx           # Lista + filtro por autor + busca por palavra-chave
│   │   ├── TitlePage.tsx          # Cabeçalho (Server Component) — lê a sessão
│   │   ├── UserMenu.tsx / Sidebar.tsx  # Menu do usuário logado (desktop/mobile)
│   │   └── ModalLogin.tsx
│   │
│   ├── layout.tsx       # Layout raiz (fonte, Provider de tema/UI/react-query, Toaster)
│   └── page.tsx         # Página inicial (/) — lista de posts
│
└── components/ui/       # Snippets do Chakra UI (provider, color-mode, tooltip, toaster)

prisma/
├── schema.prisma        # Modelos User, Author, Student, Post (MongoDB)
└── seed.ts              # Cria o usuário ADMIN inicial a partir de variáveis de ambiente
```

Fluxo de dados:

```
Página (Server Component)  →  Server Action (src/actions, via serverFetch)  →  Route Handler (/api)  →  Prisma  →  MongoDB
Componente interativo (Client)  →  fetch (src/services, useQuery/useMutation)  →  Route Handler (/api)  →  Prisma  →  MongoDB
```

`serverFetch` (`src/lib/api.ts`) existe porque, do lado do servidor, o Next não resolve caminhos relativos e não repassa automaticamente os cookies da requisição original — a função monta a URL absoluta a partir do header `host` e repassa manualmente o cookie de sessão. Os serviços client-side (`src/services/*`), por rodarem no navegador, usam `fetch` com caminho relativo normalmente.

> **Nota:** a única exceção a esse padrão é `src/app/area-professor/page.tsx`, que resolve o `authorId` da sessão atual com uma consulta Prisma direta (`db.author.findUnique(...)`) em vez de passar por um endpoint — um atalho pontual, não a convenção do projeto.

## Autenticação e autorização

A aplicação usa autenticação própria (sem provedor externo), baseada em sessão assinada:

- **Login** (`POST /api/auth/login`) valida e-mail/senha, compara a senha com o hash salvo (`bcryptjs`) e, se válido, assina um JWT (HS256, biblioteca `jose`, segredo em `SESSION_SECRET`) contendo `{ userId, role, expiresAt }`. O token é gravado em um cookie `session` (`httpOnly`, `sameSite=lax`, expira em 7 dias).
- **Logout** (`POST /api/auth/logout`) apenas remove o cookie `session`.
- `src/lib/dal.ts` expõe duas formas de ler a sessão atual:
  - `verifySession()` — decodifica o JWT do cookie e devolve só o payload assinado (`userId`, `role`, `expiresAt`), sem consultar o banco.
  - `getSession()` — decodifica o cookie e busca o registro `User` completo no banco (usado por toda a API e pelas páginas que precisam do usuário logado).

### Papéis (`Role`)

| Papel | Pode acessar | Observações |
| --- | --- | --- |
| `ADMIN` | `/admin`, e qualquer post via API (edição/exclusão) | Único papel que pode cadastrar/editar/remover professores(as) |
| `AUTHOR` (professor(a)) | `/area-professor` | Só gerencia (edita/exclui) os próprios posts |
| `STUDENT` (estudante) | Apenas as páginas públicas | Papel previsto no modelo de dados, mas hoje sem dashboard ou cadastro próprios — funciona como um visitante autenticado |

### Proteção de rotas

- **Páginas**: `src/proxy.ts` (o `middleware.ts` do Next 16) intercepta a navegação (exceto `/api`, arquivos estáticos e `favicon.ico`) e redireciona para `/` sempre que o papel da sessão não corresponder ao exigido pela rota: `/admin` exige `ADMIN`, `/area-professor` exige `AUTHOR`. A rota `/` é pública para todos os papéis, inclusive visitantes sem sessão.
- **API**: o `proxy.ts` **não** protege `/api/**`. Cada Route Handler faz sua própria checagem chamando `getSession()` e validando papel/posse do recurso — por isso a tabela de endpoints abaixo detalha a regra de autorização rota a rota.

> `User.origemId` e o modelo `Student` existem no schema do Prisma, mas não têm nenhum uso funcional no código hoje — são um espaço reservado para uma futura área do(a) estudante.

## Modelo de dados

```prisma
enum Role {
  ADMIN
  AUTHOR
  STUDENT
}

model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  email     String   @unique
  hash      String
  role      Role
  origemId  String?  @db.ObjectId
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  authors   Author?
  students  Student?
}

model Author {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  posts     Post[]
  user      User?    @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    String?  @unique @db.ObjectId
}

model Student {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    String   @db.ObjectId @unique
}

model Post {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  title     String
  text      String
  authors   Author   @relation(fields: [authorId], references: [id])
  authorId  String   @db.ObjectId
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

- `User` é o registro base de autenticação (e-mail, hash de senha e `role`) e pode ter, no máximo, um perfil `Author` **e/ou** um `Student` associado (relações 1:1 via `userId` único no lado filho).
- `Author` representa o perfil de professor(a); é criado junto com o `User` (`role: AUTHOR`) quando um(a) administrador(a) cadastra um(a) novo(a) professor(a).
- `Post` pertence a exatamente um `Author` (`authorId`); um `Author` pode ter vários posts. Não existe relação direta entre `Post` e `User`/`Student` — a posse de um post é sempre resolvida via `Author.userId === session.id`.
- O campo de relação em `Post` chama-se `authors` mas é **singular** (um único autor por post) — o nome no plural é só uma convenção de nomenclatura do schema, não indica um array.
- `Student` e `User.origemId` estão modelados, mas nenhuma rota ou tela do projeto os utiliza atualmente.

## Dependências principais

| Pacote | Versão | Uso no projeto |
| --- | --- | --- |
| [next](https://nextjs.org) | 16.3.4 | Framework — App Router, Route Handlers, `proxy.ts` (middleware) |
| [react](https://react.dev) / react-dom | 19.2.8 | Biblioteca de UI |
| [typescript](https://www.typescriptlang.org) | ^5 | Tipagem estática |
| [prisma](https://www.prisma.io) / @prisma/client | 6.19 | ORM e cliente de acesso ao MongoDB |
| [@tanstack/react-query](https://tanstack.com/query) | ^5.102.8 | Cache e sincronização de dados no cliente (`useQuery`/`useMutation`) |
| [@chakra-ui/react](https://chakra-ui.com) | ^3.37.0 | Biblioteca de componentes de UI |
| [@emotion/react](https://emotion.sh) | ^11.14.0 | Motor de estilos (CSS-in-JS) usado internamente pelo Chakra UI |
| [jose](https://github.com/panva/jose) | ^6.2.12 | Assinatura/verificação do JWT de sessão |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | ^3.0.3 | Hash de senhas |
| [zod](https://zod.dev) | — (transitiva) | Validação dos dados de formulário/API (`src/lib/definition.ts`); não está listada diretamente em `package.json`, apenas resolvida como dependência transitiva |
| [next-themes](https://github.com/pacocoursey/next-themes) | ^0.4.6 | Alternância e persistência do tema claro/escuro |
| [react-icons](https://react-icons.github.io/react-icons) | ^5.7.0 | Ícones usados na interface |
| [@react-icons/all-files](https://www.npmjs.com/package/@react-icons/all-files) | ^4.1.0 | Conjunto adicional de ícones |
| [dotenv](https://github.com/motdotla/dotenv) | ^17.4.2 | Carregamento de variáveis de ambiente |
| [eslint](https://eslint.org) / eslint-config-next | ^9 / 16.3.4 | Padronização e lint do código |
| [babel-plugin-react-compiler](https://react.dev/learn/react-compiler) | 1.0.0 | React Compiler, habilitado em `next.config.ts` |

## Como instalar e rodar

**Pré-requisitos**

- [Node.js](https://nodejs.org) 20 ou superior
- Uma instância do MongoDB acessível (local ou [Atlas](https://www.mongodb.com/atlas)) — o repositório inclui um `docker-compose.yml` para levantar um MongoDB local (com replica set já configurado, exigido pelo Prisma para transações) e o [Docker](https://www.docker.com/) para usá-lo

**Passo a passo**

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd techchallenge-3

# 2. Instalar as dependências
npm install
```

Crie um arquivo `.env` na raiz do projeto com as variáveis abaixo (sem elas a aplicação não sobe: a ausência de `SESSION_SECRET`, por exemplo, impede a criação de qualquer sessão):

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | Connection string do MongoDB usada pelo Prisma |
| `SESSION_SECRET` | Segredo usado para assinar/verificar o JWT da sessão (string longa e aleatória) |
| `ADMIN_EMAIL` | E-mail do usuário administrador criado pelo script de seed |
| `ADMIN_PASSWORD` | Senha (em texto puro) do usuário administrador — é hasheada no momento do seed |
| `ADMIN_NAME` | Nome de exibição do usuário administrador |

```bash
# 3. Criar as imagens e subir os containers do MongoDB (via Docker Compose)
docker compose up -d --build

# 4. Gerar o cliente Prisma
npx prisma generate

# 5. Sincronizar o schema com o banco
npx prisma db push

# 6. Criar o usuário administrador inicial
npm run db:seed

# 7. Rodar o servidor de desenvolvimento
npm run dev
```

O comando `docker compose up -d --build` cria as imagens (baixando `mongo:7` e `mongo-express:1`, caso ainda não existam localmente) e sobe três containers: o MongoDB (`techchallenge3-mongodb`, já configurado como replica set de nó único, requisito do Prisma para transações), um container auxiliar que inicializa esse replica set (`techchallenge3-mongodb-init`) e o [Mongo Express](https://github.com/mongo-express/mongo-express) (`techchallenge3-mongo-express`, interface web em [http://localhost:8082](http://localhost:8082) para inspecionar o banco). Se estiver usando essa infraestrutura local, aponte `DATABASE_URL` para `mongodb://localhost:27018/techchallenge3?replicaSet=rs0`. Caso já tenha uma instância própria do MongoDB (local ou Atlas), pule este passo e aponte `DATABASE_URL` diretamente para ela.

A aplicação fica disponível em [http://localhost:3000](http://localhost:3000). Faça login com o e-mail/senha definidos em `ADMIN_EMAIL`/`ADMIN_PASSWORD` para acessar `/admin` e cadastrar professores(as) — cada professor(a) cadastrado(a) pode então fazer login e acessar `/area-professor` para publicar posts.

**Outros scripts disponíveis**

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Sobe o servidor de desenvolvimento (Turbopack) |
| `npm run build` | Gera o build de produção |
| `npm run start` | Sobe o servidor a partir do build de produção |
| `npm run lint` | Executa o ESLint no projeto |
| `npm run db:seed` | Cria (ou atualiza) o usuário `ADMIN` inicial a partir do `.env` |

## Telas

### Página inicial (`/`) — pública

Cabeçalho com alternância de tema e, dependendo da sessão, um botão de login (visitante) ou o menu do usuário logado (nome, atalho para o dashboard do seu papel e "Sair"). Abaixo, a listagem de todos os posts cadastrados, exibindo título e um resumo do conteúdo, com dois controles de filtragem combináveis:

- um **select** com a lista de professores(as), que restringe os posts ao(à) autor(a) selecionado(a);
- um **campo de busca** por palavra-chave, que filtra por título ou texto.

Ao clicar em um post, o(a) usuário(a) é levado(a) à página de detalhe.

### Detalhe do post (`/:id`) — pública

Exibe o título, o conteúdo completo e o nome do(a) professor(a) responsável pelo post, com um link de retorno para a página inicial. Caso o `id` da URL não corresponda a nenhum post existente, o(a) usuário(a) é redirecionado(a) para a página inicial.

### Área administrativa (`/admin`) — requer papel `ADMIN`

Lista todos(as) os(as) professores(as) cadastrados(as) e oferece um botão que abre um modal de cadastro de novo(a) professor(a) (nome, e-mail e senha). O cadastro cria, em uma única ação, a conta de acesso (`User` com papel `AUTHOR`) e o perfil de autor (`Author`) vinculado a ela.

### Área do(a) professor(a) (`/area-professor`) — requer papel `AUTHOR`

Um botão abre um modal de criação de post (título e conteúdo). Abaixo, a lista dos posts do próprio professor(a) logado(a) — nunca de outros(as) —, cada um com botões para editar (modal pré-preenchido) ou excluir (com confirmação).

> Não existe hoje uma tela própria para o papel `STUDENT`: um(a) estudante autenticado(a) enxerga o mesmo cabeçalho/menu de usuário logado, mas navega pela aplicação como um visitante — só as páginas públicas.

## Endpoints (API Reference)

Além de consumida pelo próprio front-end (via Server Actions e serviços client-side), a API REST em `/api` pode ser usada por qualquer cliente HTTP. A sessão é enviada via cookie `session` (definido no login); rotas marcadas como autenticadas exigem esse cookie.

### Autenticação — `/api/auth`

| Método | Rota | Auth | Corpo da requisição | Resposta |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Pública | `{ "email": string, "password": string }` | `200` — `{ message }` (define o cookie `session`) · `400` erros de validação · `401` credenciais inválidas |
| `POST` | `/api/auth/logout` | Pública | — | `200` — `{ message }` (remove o cookie `session`) |

### Autores — `/api/author`

| Método | Rota | Auth | Corpo da requisição | Resposta |
| --- | --- | --- | --- | --- |
| `GET` | `/api/author` | Pública | — | `200` — array de `Author` |
| `POST` | `/api/author` | **ADMIN** | `{ "name": string, "email": string, "password": string (mín. 8) }` | `201` — `{ data, message }` · `400` validação · `403` sem permissão · `409` e-mail já cadastrado |
| `GET` | `/api/author/:id` | Pública | — | `200` — `Author` · `404` se não encontrado |
| `PUT` | `/api/author/:id` | **ADMIN** | `{ "name": string }` | `200` — `{ data, message }` · `400`/`403`/`404` |
| `DELETE` | `/api/author/:id` | **ADMIN** | — | `200` — `{ message }` · `403`/`404` |

### Posts — `/api/post`

| Método | Rota | Auth | Corpo / query | Resposta |
| --- | --- | --- | --- | --- |
| `GET` | `/api/post` | Pública | Query params opcionais e combináveis: `q` (busca em `title`/`text`, case-insensitive) e `authorId` (filtra por autor) | `200` — array de `Post` (cada um já com `authors` embutido) |
| `POST` | `/api/post` | **AUTHOR** (usuário logado com perfil de `Author`) | `{ "title": string, "text": string }` — o `authorId` é sempre resolvido a partir da sessão, nunca aceito no corpo | `201` — `{ data, message }` · `400` validação · `401` sem sessão · `403` sem perfil de autor |
| `GET` | `/api/post/:id` | Pública | — | `200` — `Post` · `404` se não encontrado |
| `PUT` | `/api/post/:id` | **ADMIN ou o(a) autor(a) dono(a) do post** | `{ "title": string, "text": string }` | `200` — `{ data, message }` · `400`/`403`/`404` |
| `DELETE` | `/api/post/:id` | **ADMIN ou o(a) autor(a) dono(a) do post** | — | `200` — `{ message }` · `403`/`404` |

**Exemplo — login**

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "professor@exemplo.com", "password": "minhasenha"}'
```

```json
{
  "message": "Login realizado com sucesso!"
}
```

A resposta inclui um header `Set-Cookie: session=...` — reenvie esse cookie nas próximas requisições (por exemplo, `curl -b cookies.txt -c cookies.txt ...`) para acessar rotas autenticadas, como `POST /api/post`.

## Roadmap / Melhorias futuras

- [ ] Dashboard e cadastro próprios para o papel `STUDENT` (hoje só existe no modelo de dados/sessão, sem tela dedicada).
- [ ] Telas administrativas para editar/excluir posts de qualquer autor (hoje essa permissão do `ADMIN` só existe via API, sem interface).
- [ ] Invalidar o cache do TanStack Query ao criar um post (`ModalCreatePost` hoje usa `router.refresh()`, que não atualiza as listas que usam `useQuery`/`useMutation`) — pode exigir um reload manual para o novo post aparecer.
- [ ] Paginação (ou scroll infinito) na listagem de posts.
- [ ] Guarda de sessão explícita nas próprias páginas `/admin`/`/area-professor` (hoje dependem só do redirecionamento feito em `src/proxy.ts`).
- [ ] Unificar a origem do tipo `Post` em `src/services/post.ts` (importado de `generated/prisma/browser`, enquanto o restante do projeto usa `generated/prisma/client`).
- [ ] Testes automatizados (unitários para Route Handlers e end-to-end para os fluxos de login, criação/edição/exclusão de posts e autores).
- [ ] Estados de carregamento e de erro explícitos nas páginas/listas que buscam dados assíncronos.
- [ ] Implementar a criação dos perfis de Professor e Estudantes para receberem um e-mail e fazendo com que eles criem sua senha de acesso.

