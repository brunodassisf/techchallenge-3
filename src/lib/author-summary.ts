import type { Prisma } from "../../generated/prisma/client";

/**
 * `include` necessário para montar o resumo de um autor: quantidade de posts e
 * o status da conta de login (só `deactivatedAt`, nunca e-mail/hash).
 */
export const authorSummaryInclude = {
  _count: { select: { posts: true } },
  user: { select: { deactivatedAt: true } },
} satisfies Prisma.AuthorInclude;

type AuthorWithSummary = Prisma.AuthorGetPayload<{ include: typeof authorSummaryInclude }>;

/**
 * Formato público de um autor nas rotas `/api/author`: os campos do `Author`
 * mais `postCount` e `active`, sem os objetos `_count` e `user`.
 * Autor sem conta de login (`userId` vazio) é considerado ativo.
 */
export function toAuthorSummary({ _count, user, ...author }: AuthorWithSummary) {
  return { ...author, postCount: _count.posts, active: !user?.deactivatedAt };
}
