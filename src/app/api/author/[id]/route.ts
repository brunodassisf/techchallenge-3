import { prisma, Prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const post = await prisma.author.findUnique({ where: { id } });

  if (!post) {
    return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name } = body;

  if (
    !name ||
    typeof name !== "string" ||
    !name.trim()
  ) {
    return NextResponse.json(
      { error: "Os campos 'title' e 'text' são obrigatórios." },
      { status: 400 }
    );
  }

  try {
    const author = await prisma.author.update({
      where: { id },
      data: {
        name: name.trim()
      },
    });

    return NextResponse.json({ data: author, message: "Autor atualizado com sucesso!" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Autor não encontrado." }, { status: 404 });
    }

    throw error;
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.author.delete({ where: { id } });

    return NextResponse.json({ message: "Autor removido com sucesso!" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Autor não encontrado." }, { status: 404 });
    }

    throw error;
  }
}
