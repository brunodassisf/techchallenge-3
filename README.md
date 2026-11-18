# Tech Challenge 3: Blog Acadêmico

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-149ECA?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Chakra UI](https://img.shields.io/badge/Chakra%20UI-3.37-319795?logo=chakraui)](https://chakra-ui.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma)](https://www.prisma.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)](https://www.mongodb.com)
[![CI](https://github.com/brunodassisf/techchallenge-3/actions/workflows/ci.yml/badge.svg)](https://github.com/brunodassisf/techchallenge-3/actions/workflows/ci.yml)

Blog de escola feito em Next.js. Professores publicam posts. Estudantes leem e comentam. O admin cuida das contas.

O mesmo projeto tem o site e a API REST (`/api`). A API também atende o app mobile do Tech Challenge 4.

## Sumário

- [Quem faz o quê](#quem-faz-o-quê)
- [O que mudou na API](#o-que-mudou-na-api)
- [Como rodar](#como-rodar)
- [Como funciona o login](#como-funciona-o-login)
- [Rotas da API](#rotas-da-api)
- [Banco de dados](#banco-de-dados)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Telas do site](#telas-do-site)
- [CI](#ci)
- [Próximos passos](#próximos-passos)

## Quem faz o quê

| Papel | O que pode fazer |
| --- | --- |
| Visitante | Ler, buscar e filtrar posts. |
| `STUDENT` (estudante) | Tudo do visitante. Criar a própria conta, editar os próprios dados e comentar posts. |
| `AUTHOR` (professor) | Criar posts e editar ou excluir só os seus. Apagar comentários nos seus posts. |
| `ADMIN` | Cadastrar, editar, desativar e remover professores. Gerenciar estudantes. Editar ou excluir qualquer post. Apagar qualquer comentário. |

## O que mudou na API

Estes ajustes deixaram a API pronta para o app mobile:

- **Token Bearer.** O login devolve o JWT no corpo. O app manda `Authorization: Bearer <token>`. O site segue usando o cookie.
- **Login diz quem é a pessoa.** A resposta traz `user` com `id`, `name`, `role`, `authorId` e `studentId`. Com isso o app sabe o que mostrar.
- **Matéria do post.** Todo post tem `category` (Matemática, Português etc.). Sem categoria, vira `GERAL`.
- **Primeiro acesso.** Professor novo nasce com uma senha padrão. Ele só entra depois de criar a própria senha.
- **Desativar professor.** O admin pode tirar o acesso sem apagar os posts.
- **Remover professor com posts é bloqueado.** A API responde `409` e sugere desativar.
- **Cadastro de estudante.** Rota pública. O estudante escolhe a senha e já sai logado.
- **Meus dados.** Estudante e professor editam nome, e-mail e senha.
- **Gestão de estudantes.** O admin lista, edita, reseta a senha e exclui.
- **Comentários.** Estudante comenta. Dono edita. Dono, professor do post ou admin apaga.
- **Admin criado sozinho.** Ao subir, a API cria o admin do `.env` se o banco não tiver nenhum.
- **Erro de dado é `400`, nunca `401`.** Senha atual errada, por exemplo, vem como erro de campo. O app trata `401` como sessão vencida e desloga.

## Como rodar

Você precisa de [Node.js](https://nodejs.org) 20+ e [Docker](https://www.docker.com/).

### Opção 1: tudo no Docker (mais fácil)

```bash
docker compose up -d --build
```

Pronto. Site e API em [http://localhost:3000](http://localhost:3000). Mongo Express (para ver o banco) em [http://localhost:8082](http://localhost:8082).

Para parar: `docker compose down`. Use `-v` para apagar o banco também.

Antes, crie o `.env` com pelo menos `DEFAULT_TEACHER_PASSWORD`. Sem ela o Compose não sobe. As outras variáveis têm valor padrão de desenvolvimento no `docker-compose.yml`.

> Mudou uma rota? Rode `docker compose up -d --build app`. O container usa a imagem buildada, não o código ao vivo.

### Opção 2: Node na máquina, banco no Docker

```bash
npm install
docker compose up -d mongodb mongodb-init mongo-express
npx prisma generate
npx prisma db push
npm run dev
```

Nesse caso, use `DATABASE_URL=mongodb://localhost:27018/techchallenge3?replicaSet=rs0`.

### Variáveis do `.env`

| Variável | Para que serve |
| --- | --- |
| `DATABASE_URL` | Endereço do MongoDB. |
| `SESSION_SECRET` | Segredo que assina o JWT. Use um texto longo e aleatório. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Dados do admin criado ao subir, se o banco não tiver nenhum. |
| `DEFAULT_TEACHER_PASSWORD` | Senha padrão de professor novo e de estudante resetado (mín. 8 caracteres). |
| `INTERNAL_API_URL` | Opcional. URL que o servidor usa para chamar a própria API. |
| `COOKIE_SECURE` | Opcional. `false` libera o cookie sem HTTPS. |

### Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm run start` | Build e servidor de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Gera os tipos das rotas e roda o `tsc` |

### Postman

A coleção pronta fica em [`postman/TechChallenge3.postman_collection.json`](postman/TechChallenge3.postman_collection.json). Importe no Postman. Ela já usa o token Bearer.

## Como funciona o login

1. `POST /api/auth/login` confere e-mail e senha (hash com `bcryptjs`).
2. Se der certo, a API cria um JWT de 7 dias (`jose`).
3. O token vai no corpo (`token`) e também num cookie `session`.
4. Nas rotas protegidas, mande o header `Authorization: Bearer <token>` ou o cookie. O header ganha se vierem os dois.

O logout só apaga o cookie. Quem usa Bearer só precisa jogar o token fora.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techchallenge.com","password":"<sua-senha>"}'
```

```json
{
  "message": "Login realizado com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresAt": "2026-11-09T12:00:00.000Z",
  "user": { "id": "...", "name": "Ana Silva", "role": "AUTHOR", "authorId": "...", "studentId": null }
}
```

O `user` nunca traz e-mail nem hash. Compare `authorId` com `post.authorId` e `studentId` com `comment.studentId` para saber se o item é da pessoa.

### Casos especiais

- **Primeiro acesso.** Se a conta ainda usa a senha padrão, o login responde `403` com `code: "FIRST_ACCESS_REQUIRED"` e não cria sessão. O app chama `POST /api/auth/first-access` com a senha padrão e a nova. A resposta é igual à do login.
- **Conta desativada.** O login responde `403` "Conta desativada. Fale com a coordenação.". Tokens antigos passam a dar `401` na hora. Essa checagem vem depois da senha, para não revelar se o e-mail existe.
- **`401` ou `403`?** `401` = sem sessão (sem token, token vencido ou conta desativada). Mande para o login. `403` = tem sessão, mas não tem permissão.
- **Id inválido.** Id que não é ObjectId responde `404`, igual a "não encontrado".

### Proteção

- Páginas: `src/proxy.ts` manda para `/` quem não tem o papel certo. `/admin` pede `ADMIN`. `/area-professor` pede `AUTHOR`.
- API: cada rota checa a sessão sozinha com `getSession()`. Essa função também barra conta desativada.

## Rotas da API

Legenda: 🔓 pública · 🔑 precisa de login.

### Login: `/api/auth`

| Rota | Quem | Corpo | Respostas |
| --- | --- | --- | --- |
| `POST /api/auth/login` | 🔓 | `email`, `password` | `200` login · `400` campo · `401` e-mail ou senha errados · `403` desativado ou primeiro acesso |
| `POST /api/auth/first-access` | 🔓 | `email`, `currentPassword`, `password` (mín. 8), `confirmPassword` | `200` login · `400` campo · `401` · `403` desativado · `409` senha já criada |
| `POST /api/auth/logout` | 🔓 | — | `200` |

No primeiro acesso, a nova senha não pode ser igual à padrão (`400` no campo `password`).

### Posts: `/api/post`

| Rota | Quem | Corpo | Respostas |
| --- | --- | --- | --- |
| `GET /api/post` | 🔓 | query `q` e `authorId` (opcionais) | `200` lista, mais novo primeiro |
| `GET /api/post/:id` | 🔓 | — | `200` · `404` |
| `POST /api/post` | 🔑 professor | `title`, `text`, `category?` | `201` · `400` · `401` · `403` |
| `PUT /api/post/:id` | 🔑 dono ou admin | `title`, `text`, `category?` | `200` · `400` · `401` · `403` · `404` |
| `DELETE /api/post/:id` | 🔑 dono ou admin | — | `200` · `401` · `403` · `404` |

- `q` busca no título, no texto e no nome do professor. Não importa maiúscula ou minúscula.
- O autor do post sai da sessão. A API ignora `authorId` no corpo.
- `category` aceita: `MATEMATICA`, `PORTUGUES`, `CIENCIAS`, `HISTORIA`, `GEOGRAFIA`, `INGLES`, `ARTES`, `EDUCACAO_FISICA`, `GERAL`. Ao criar sem ela, vira `GERAL`. Ao editar sem ela, fica a atual.

### Comentários

| Rota | Quem | Corpo | Respostas |
| --- | --- | --- | --- |
| `GET /api/post/:id/comment` | 🔓 | — | `200` lista, mais antigo primeiro · `404` post não existe |
| `POST /api/post/:id/comment` | 🔑 estudante | `text` (1 a 1000) | `201` · `400` · `401` · `403` · `404` |
| `PUT /api/comment/:id` | 🔑 dono do comentário | `text` | `200` · `400` · `401` · `403` · `404` |
| `DELETE /api/comment/:id` | 🔑 dono, professor do post ou admin | — | `200` · `401` · `403` · `404` |

Cada comentário vem com `student: { id, name }`. O e-mail do estudante não aparece.

### Professores: `/api/author`

| Rota | Quem | Corpo | Respostas |
| --- | --- | --- | --- |
| `GET /api/author` | 🔓 | — | `200` lista por nome, com `postCount` e `active` |
| `GET /api/author/:id` | 🔓 | — | `200` · `404` |
| `POST /api/author` | 🔑 admin | `name`, `email` | `201` · `400` · `401` · `403` · `409` e-mail já usado · `500` senha padrão não configurada |
| `PUT /api/author/:id` | 🔑 admin | `name` | `200` · `400` · `401` · `403` · `404` |
| `PATCH /api/author/:id/status` | 🔑 admin | `{ "active": true }` ou `false` | `200` · `400` · `401` · `403` · `404` · `409` sem conta de login |
| `DELETE /api/author/:id` | 🔑 admin | — | `200` · `401` · `403` · `404` · `409` tem posts |
| `GET /api/author/me` | 🔑 professor | — | `200` `{ name, email }` · `401` · `403` |
| `PUT /api/author/me` | 🔑 professor | igual a `PUT /api/student/me` | `200` (com `authorId`) · `400` · `401` · `403` · `409` |

- Professor novo nasce com a senha padrão e precisa do primeiro acesso.
- Desativar mantém os posts no ar, com o nome dele. Repetir a ação não dá erro.
- Remover só funciona sem posts. Aí a conta de login some junto.

### Estudantes: `/api/student`

| Rota | Quem | Corpo | Respostas |
| --- | --- | --- | --- |
| `POST /api/student` | 🔓 | `name`, `email`, `password` (mín. 8), `confirmPassword` | `201` login · `400` · `409` e-mail já usado |
| `GET /api/student/me` | 🔑 estudante | — | `200` `{ name, email }` · `401` · `403` |
| `PUT /api/student/me` | 🔑 estudante | `name`, `email`, `currentPassword?`, `password?`, `confirmPassword?` | `200` · `400` · `401` · `403` · `409` |
| `GET /api/student` | 🔑 admin | — | `200` lista por nome · `401` · `403` |
| `PUT /api/student/:id` | 🔑 admin | `name`, `email` | `200` · `400` · `401` · `403` · `404` · `409` |
| `DELETE /api/student/:id` | 🔑 admin | — | `200` · `401` · `403` · `404` |
| `POST /api/student/:id/reset-password` | 🔑 admin | — | `200` · `401` · `403` · `404` · `500` |

- No cadastro, o estudante escolhe a senha. Não tem senha padrão.
- Em "Meus dados", trocar e-mail ou senha pede `currentPassword`. Só trocar o nome, não.
- Senha atual errada responde `400` no campo `currentPassword`. Nunca `401`.
- O token continua valendo depois de editar.
- Resetar a senha volta para a senha padrão e liga o primeiro acesso.
- O `:id` é o do `Student`, o mesmo da listagem.

### Formato dos erros

```json
{ "errors": { "confirmPassword": ["As senhas não coincidem."] } }
```

`400` traz `errors` por campo. Os outros erros trazem só `error` com a mensagem.

## Banco de dados

MongoDB com Prisma. O schema completo está em [`prisma/schema.prisma`](prisma/schema.prisma).

| Model | O que guarda |
| --- | --- |
| `User` | Login: e-mail, hash, `role`, `firstAccess`, `deactivatedAt`. |
| `Author` | Perfil do professor. Ligado a um `User`. |
| `Student` | Perfil do estudante. Ligado a um `User`. |
| `Post` | Título, texto, `category` e um `Author`. |
| `Comment` | Texto, um `Post` e um `Student`. Some se o post ou o estudante for apagado. |

Detalhes que confundem:

- O campo `Post.authors` está no plural, mas guarda um autor só.
- Docs antigos no Mongo não têm `deactivatedAt`. Por isso o status é lido no código (`!user.deactivatedAt`), não filtrado no banco.
- `User.origemId` existe no schema, mas nada usa.

## Estrutura de pastas

```
src/
├── app/
│   ├── api/            # Rotas da API (auth, author, post, comment, student)
│   ├── admin/          # Tela do admin
│   ├── area-professor/ # Tela do professor
│   ├── [post]/         # Detalhe do post
│   └── page.tsx        # Página inicial
├── actions/            # Leitura de dados para Server Components
├── services/           # fetch usado pelos Client Components (TanStack Query)
├── lib/                # Sessão, Prisma, validação (Zod) e helpers da API
├── instrumentation.ts  # Roda ao subir: cria o admin se faltar
└── proxy.ts            # Protege as páginas por papel
```

O site não fala com o Prisma direto. Tudo passa pela API:

```
Página  →  actions/ ou services/  →  /api  →  Prisma  →  MongoDB
```

A única exceção é `src/app/area-professor/page.tsx`, que busca o `authorId` direto no Prisma.

## Telas do site

- **`/`** (pública): lista de posts com busca e filtro por professor. Tema claro e escuro.
- **`/:id`** (pública): post completo.
- **`/admin`** (admin): abas Professores (com cadastro) e Estudantes (só leitura).
- **`/area-professor`** (professor): criar, editar e excluir os próprios posts, com matéria.

O site não tem telas de estudante, de cadastro nem de primeiro acesso. Isso fica no app mobile.

## CI

O [GitHub Actions](.github/workflows/ci.yml) roda em cada push e PR na `master`:

1. Lint, typecheck e build.
2. Sobe tudo no Docker e testa `/`, `/api/post` e `/api/author`.

## Próximos passos

- [ ] Telas de estudante no site.
- [ ] Telas para o admin editar ou excluir qualquer post.
- [ ] Atualizar o cache do TanStack Query ao criar post (hoje pode pedir reload).
- [ ] Paginação na lista de posts.
- [ ] Testes automatizados.
- [ ] Estados de carregando e de erro nas listas.
- [ ] Enviar e-mail para professor e estudante criarem a senha.
