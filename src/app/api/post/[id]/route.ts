import { db } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { Role } from "../../../../../generated/prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const post = await db.post.findUnique({ where: { id }, include: { authors: true } });

  if (!post) {
    return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
  }

  return NextResponse.json(post);
}

/** ADMIN pode gerenciar qualquer post; um professor só o próprio. */
async function canManagePost(postAuthorId: string) {
  const session = await getSession();
  if (!session) return false;
  if (session.role === Role.ADMIN) return true;

  const author = await db.author.findUnique({ where: { userId: session.id } });
  return author?.id === postAuthorId;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { title, text } = body;

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

  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
  }

  if (!(await canManagePost(existing.authorId))) {
    return NextResponse.json(
      { error: "Você não tem permissão para editar este post." },
      { status: 403 }
    );
  }

  const post = await db.post.update({
    where: { id },
    data: { title: title.trim(), text: text.trim() },
  });

  return NextResponse.json({ data: post, message: "Post atualizado com sucesso!" });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
  }

  if (!(await canManagePost(existing.authorId))) {
    return NextResponse.json(
      { error: "Você não tem permissão para remover este post." },
      { status: 403 }
    );
  }

  await db.post.delete({ where: { id } });

  return NextResponse.json({ message: "Post removido com sucesso!" });
}
