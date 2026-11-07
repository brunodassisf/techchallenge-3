import { db } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { isObjectId } from "@/lib/object-id";
import { Category, Role, type User } from "../../../../../generated/prisma/client";
import { NextResponse } from "next/server";

const notFound = () =>
  NextResponse.json({ error: "Post não encontrado." }, { status: 404 });

const unauthorized = () =>
  NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isObjectId(id)) return notFound();

  const post = await db.post.findUnique({ where: { id }, include: { authors: true } });

  if (!post) return notFound();

  return NextResponse.json(post);
}

/** ADMIN pode gerenciar qualquer post; um professor só o próprio. */
async function canManagePost(session: User, postAuthorId: string) {
  if (session.role === Role.ADMIN) return true;

  const author = await db.author.findUnique({ where: { userId: session.id } });
  return author?.id === postAuthorId;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Sem sessão (sem token ou token inválido/expirado) é 401; sem permissão é 403.
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const body = await request.json();
  const { title, text, category } = body;

  if (
    !title ||
    typeof title !== "string" ||
    !title.trim() ||
    !text ||
    typeof text !== "string" ||
    !text.trim()
  ) {
    return NextResponse.json(
      { error: "Os campos 'title' e 'text' são obrigatórios." },
      { status: 400 }
    );
  }

  // category é opcional: ausente mantém a categoria atual do post.
  if (
    category !== undefined &&
    !Object.values(Category).includes(category as Category)
  ) {
    return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });
  }

  if (!isObjectId(id)) return notFound();

  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) return notFound();

  if (!(await canManagePost(session, existing.authorId))) {
    return NextResponse.json(
      { error: "Você não tem permissão para editar este post." },
      { status: 403 }
    );
  }

  const post = await db.post.update({
    where: { id },
    data: { title: title.trim(), text: text.trim(), category },
  });

  return NextResponse.json({ data: post, message: "Post atualizado com sucesso!" });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  if (!isObjectId(id)) return notFound();

  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) return notFound();

  if (!(await canManagePost(session, existing.authorId))) {
    return NextResponse.json(
      { error: "Você não tem permissão para remover este post." },
      { status: 403 }
    );
  }

  await db.post.delete({ where: { id } });

  return NextResponse.json({ message: "Post removido com sucesso!" });
}
