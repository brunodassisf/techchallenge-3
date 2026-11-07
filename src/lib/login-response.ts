import { NextResponse } from "next/server";
import { db } from "./prisma";
import { createSession } from "./session";
import type { User } from "../../generated/prisma/client";

/**
 * Resposta de sucesso do login, compartilhada com o primeiro acesso para o
 * formato ser idêntico. Cria a sessão: o cookie `session` serve ao front-end
 * Next e o `token` no corpo, a clientes externos (`Authorization: Bearer`).
 * `user` traz só o necessário para o app (nunca hash/e-mail).
 */
export async function loginSuccessResponse(user: Pick<User, "id" | "name" | "role">) {
  const { token, expiresAt } = await createSession(user.id, user.role);

  // Perfil de professor(a) ligado ao usuário; alunos e admin sem perfil não têm.
  const author = await db.author.findUnique({ where: { userId: user.id } });

  return NextResponse.json({
    message: "Login realizado com sucesso!",
    token,
    tokenType: "Bearer",
    expiresAt,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      authorId: author?.id ?? null,
    },
  });
}
