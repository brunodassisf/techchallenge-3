import { db } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { CreatePostFormSchema } from "@/lib/definition";
import { Prisma } from "../../../../generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/post                          -> todos os posts
 * GET /api/post?q=termo                  -> só os posts cujo título ou texto contém "termo" (case-insensitive)
 * GET /api/post?authorId=123             -> só os posts desse autor
 * GET /api/post?authorId=123&q=termo     -> os dois filtros combinados (E, não OU)
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const authorId = request.nextUrl.searchParams.get("authorId")?.trim();

  const where: Prisma.PostWhereInput = {};
  if (authorId) {
    where.authorId = authorId;
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { text: { contains: q, mode: "insensitive" } },
    ];
  }

  const posts = await db.post.findMany({
    where,
    include: { authors: true },
  });

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Você precisa estar logado para criar um post." },
      { status: 401 }
    );
  }

  const author = await db.author.findUnique({ where: { userId: session.id } });
  if (!author) {
    return NextResponse.json(
      { error: "Apenas professores podem criar posts." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const validatedFields = CreatePostFormSchema.safeParse(body);

  if (!validatedFields.success) {
    return NextResponse.json(
      { errors: validatedFields.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { title, text } = validatedFields.data;

  const post = await db.post.create({
    data: { title, text, authorId: author.id },
  });

  return NextResponse.json(
    { data: post, message: "Post cadastrado com sucesso!" },
    { status: 201 }
  );
}
