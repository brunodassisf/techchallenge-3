import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json(
      { error: "O campo 'name' é obrigatório." },
      { status: 400 }
    );
  }

  const author = await prisma.author.create({
    data: { name: name.trim() },
  });

  return NextResponse.json({ data: author, message: 'Autor cadastrado com sucesso!' }, { status: 201 });
}

export async function GET() {
  const authors = await prisma.author.findMany();

  return NextResponse.json(authors);
}
