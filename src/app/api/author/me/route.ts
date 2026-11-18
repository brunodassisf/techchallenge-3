import { db } from "@/lib/prisma";
import { getMeUser, updateMe } from "@/lib/my-profile";
import { Role } from "../../../../../generated/prisma/client";
import { NextResponse } from "next/server";

const FORBIDDEN = "Apenas professores têm esta página.";

/** "Meus dados" do professor logado. */
export async function GET() {
  const user = await getMeUser(Role.AUTHOR, FORBIDDEN);
  if (user instanceof NextResponse) return user;

  return NextResponse.json({ name: user.name, email: user.email });
}

/** Edita nome, e-mail e senha do professor logado (regras em updateMe). */
export async function PUT(request: Request) {
  const user = await getMeUser(Role.AUTHOR, FORBIDDEN);
  if (user instanceof NextResponse) return user;

  // authorId volta na resposta: o app mescla o user na sessão e precisa dele
  // para saber quais posts são do professor.
  const author = await db.author.findUnique({ where: { userId: user.id }, select: { id: true } });

  return updateMe(
    user,
    request,
    (name) => db.author.updateMany({ where: { userId: user.id }, data: { name } }),
    author?.id ?? null
  );
}
