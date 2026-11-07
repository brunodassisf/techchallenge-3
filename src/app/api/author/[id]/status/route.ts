import { db } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { isObjectId } from "@/lib/object-id";
import { authorSummaryInclude, toAuthorSummary } from "@/lib/author-summary";
import { Role } from "../../../../../../generated/prisma/client";
import { NextResponse } from "next/server";

/**
 * PATCH /api/author/:id/status — ADMIN desativa (`{ active: false }`) ou
 * reativa (`{ active: true }`) a conta de login do professor. Os posts dele
 * não mudam. Repetir a mesma ação não é erro (idempotente).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });
  }
  if (session.role !== Role.ADMIN) {
    return NextResponse.json(
      { error: "Apenas administradores podem desativar professores." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const active = body?.active;
  if (typeof active !== "boolean") {
    return NextResponse.json(
      { error: "Envie { active: true } ou { active: false }." },
      { status: 400 }
    );
  }

  const { id } = await params;
  const notFound = NextResponse.json({ error: "Autor não encontrado." }, { status: 404 });
  if (!isObjectId(id)) return notFound;

  const author = await db.author.findUnique({ where: { id } });
  if (!author) return notFound;

  // Sem userId, ou userId apontando para um User que não existe mais.
  const user = author.userId
    ? await db.user.findUnique({ where: { id: author.userId } })
    : null;
  if (!author.userId || !user) {
    return NextResponse.json(
      { error: "Este professor não tem conta de login para desativar." },
      { status: 409 }
    );
  }

  // Desativar quem já está desativado mantém a data original da desativação.
  const alreadyInactive = Boolean(user.deactivatedAt);
  if (active || !alreadyInactive) {
    await db.user.update({
      where: { id: author.userId },
      data: { deactivatedAt: active ? null : new Date() },
    });
  }

  const updated = await db.author.findUniqueOrThrow({
    where: { id },
    include: authorSummaryInclude,
  });

  return NextResponse.json({
    data: toAuthorSummary(updated),
    message: active ? "Professor reativado." : "Professor desativado.",
  });
}
