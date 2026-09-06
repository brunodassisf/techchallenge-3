import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const posts = await prisma.post.findMany();

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
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

  if (!authorId || typeof authorId !== "string") {
    return NextResponse.json(
      { error: "O campo 'authorId' é obrigatório." },
      { status: 400 }
    );
  }

  const post = await prisma.post.create({
    data: { title: title.trim(), text: text.trim(), authorId },
  });

  return NextResponse.json(
    { data: post, message: "Post cadastrado com sucesso!" },
    { status: 201 }
  );
}