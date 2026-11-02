import { LoginFormSchema } from "@/lib/definition";
import { db } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { NextResponse } from "next/server";
import { compare } from "bcryptjs";

export async function POST(request: Request) {
  const body = await request.json();
  const validatedFields = LoginFormSchema.safeParse(body);

  if (!validatedFields.success) {
    return NextResponse.json(
      { errors: validatedFields.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, password } = validatedFields.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const passwordMatch = await compare(password, user.hash);
  if (!passwordMatch) {
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const { token, expiresAt } = await createSession(user.id, user.role);

  // Perfil de professor(a) ligado ao usuário; alunos e admin sem perfil não têm.
  const author = await db.author.findUnique({ where: { userId: user.id } });

  // O cookie `session` continua sendo definido para o front-end Next; o token
  // no corpo permite que clientes externos usem `Authorization: Bearer <token>`.
  // `user` traz só o necessário para o app (nunca hash/e-mail).
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
