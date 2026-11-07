import { db } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { isObjectId } from "@/lib/object-id";
import { authorSummaryInclude, toAuthorSummary } from "@/lib/author-summary";
import { Role } from "../../../../../generated/prisma/client";
import { NextResponse } from "next/server";

const notFound = () =>
  NextResponse.json({ error: "Autor não encontrado." }, { status: 404 });

const unauthorized = () =>
  NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isObjectId(id)) return notFound();

  const author = await db.author.findUnique({ where: { id }, include: authorSummaryInclude });

  if (!author) return notFound();

  return NextResponse.json(toAuthorSummary(author));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (session.role !== Role.ADMIN) {
    return NextResponse.json(
      { error: "Apenas administradores podem editar professores." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json(
      { error: "O campo 'name' é obrigatório." },
      { status: 400 }
    );
  }

  if (!isObjectId(id)) return notFound();

  const existing = await db.author.findUnique({ where: { id } });
  if (!existing) return notFound();

  const author = await db.author.update({
    where: { id },
    data: { name: name.trim() },
  });

  return NextResponse.json({ data: author, message: "Autor atualizado com sucesso!" });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (session.role !== Role.ADMIN) {
    return NextResponse.json(
      { error: "Apenas administradores podem remover professores." },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (!isObjectId(id)) return notFound();

  const existing = await db.author.findUnique({ where: { id } });
  if (!existing) return notFound();

  // Post exige autor: com posts, a remoção é bloqueada em vez de falhar com 500.
  // O caminho para tirar o acesso mantendo os posts é desativar (PATCH .../status).
  const postCount = await db.post.count({ where: { authorId: id } });
  if (postCount > 0) {
    const posts = postCount === 1 ? "1 post" : `${postCount} posts`;
    return NextResponse.json(
      {
        error: `Este professor tem ${posts}. Desative o professor para manter os posts publicados.`,
        postCount,
      },
      { status: 409 }
    );
  }

  // Remove o perfil e a conta de login juntos, para a pessoa não conseguir
  // mais entrar no sistema.
  await db.$transaction([
    db.author.delete({ where: { id } }),
    ...(existing.userId ? [db.user.delete({ where: { id: existing.userId } })] : []),
  ]);

  return NextResponse.json({ message: "Professor removido com sucesso!" });
}
