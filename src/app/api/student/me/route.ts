import { db } from "@/lib/prisma";
import { getMeUser, updateMe } from "@/lib/my-profile";
import { Role } from "../../../../../generated/prisma/client";
import { NextResponse } from "next/server";

const FORBIDDEN = "Apenas estudantes têm esta página.";

/** "Meus dados" do estudante logado. */
export async function GET() {
  const user = await getMeUser(Role.STUDENT, FORBIDDEN);
  if (user instanceof NextResponse) return user;

  return NextResponse.json({ name: user.name, email: user.email });
}

/** Edita nome, e-mail e senha do estudante logado (regras em updateMe). */
export async function PUT(request: Request) {
  const user = await getMeUser(Role.STUDENT, FORBIDDEN);
  if (user instanceof NextResponse) return user;

  return updateMe(
    user,
    request,
    (name) => db.student.updateMany({ where: { userId: user.id }, data: { name } }),
    null
  );
}
