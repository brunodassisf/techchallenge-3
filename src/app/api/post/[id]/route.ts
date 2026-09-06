import { prisma, Prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const post = await prisma.post.findUnique({ where: { id } });

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
  const { title, text, authorId } = body;

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

  try {
    const post = await prisma.post.update({
      where: { id },
      data: {
        title: title.trim(),
        text: text.trim(),
        ...(authorId ? { authorId } : {}),
      },
    });

    return NextResponse.json({ data: post, message: "Post atualizado com sucesso!" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
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
    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ message: "Post removido com sucesso!" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
    }

    throw error;
  }
}
