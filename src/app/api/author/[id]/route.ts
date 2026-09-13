import { db } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { Role } from "../../../../../generated/prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const author = await db.author.findUnique({ where: { id } });

  if (!author) {
    return NextResponse.json({ error: "Autor não encontrado." }, { status: 404 });
  }

  return NextResponse.json(author);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (session?.role !== Role.ADMIN) {
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

  const existing = await db.author.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Autor não encontrado." }, { status: 404 });
  }

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
  if (session?.role !== Role.ADMIN) {
    return NextResponse.json(
      { error: "Apenas administradores podem remover professores." },
      { status: 403 }
    );
  }

  const { id } = await params;

  const existing = await db.author.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Autor não encontrado." }, { status: 404 });
  }

  await db.author.delete({ where: { id } });

  return NextResponse.json({ message: "Autor removido com sucesso!" });
}
