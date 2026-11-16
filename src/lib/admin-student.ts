import { db } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { isObjectId } from "@/lib/object-id";
import { Role } from "../../generated/prisma/client";
import { NextResponse } from "next/server";

const notFound = () => NextResponse.json({ error: "Estudante não encontrado." }, { status: 404 });

/** Estudante do `id` (com o User) se a sessão for de ADMIN; senão, a resposta de erro. */
export async function adminStudent(id: string) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });
  if (session.role !== Role.ADMIN) {
    return NextResponse.json(
      { error: "Apenas administradores podem gerenciar estudantes." },
      { status: 403 }
    );
  }
  if (!isObjectId(id)) return notFound();
  const student = await db.student.findUnique({ where: { id }, include: { user: true } });
  return student ?? notFound();
}
