import { db } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { isObjectId } from "@/lib/object-id";
import { commentSelect } from "@/lib/comment";
import { CommentFormSchema } from "@/lib/definition";
import { Role } from "../../../../../../generated/prisma/client";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

const postNotFound = () =>
  NextResponse.json({ error: "Post não encontrado." }, { status: 404 });

function findPost(id: string) {
  return isObjectId(id) ? db.post.findUnique({ where: { id }, select: { id: true } }) : null;
}

/** Público: comentários do post, do mais antigo para o mais novo. */
export async function GET(_request: Request, { params }: Params) {
  const post = await findPost((await params).id);
  if (!post) return postNotFound();

  const comments = await db.comment.findMany({
    where: { postId: post.id },
    select: commentSelect,
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

/** Só estudante comenta. */
export async function POST(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });
  }

  const student =
    session.role === Role.STUDENT
      ? await db.student.findUnique({ where: { userId: session.id } })
      : null;
  if (!student) {
    return NextResponse.json({ error: "Apenas estudantes podem comentar." }, { status: 403 });
  }

  const post = await findPost((await params).id);
  if (!post) return postNotFound();

  const body = await request.json().catch(() => null);
  const validatedFields = CommentFormSchema.safeParse(body);
  if (!validatedFields.success) {
    return NextResponse.json(
      { errors: validatedFields.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const comment = await db.comment.create({
    data: { text: validatedFields.data.text, postId: post.id, studentId: student.id },
    select: commentSelect,
  });

  return NextResponse.json(
    { data: comment, message: "Comentário publicado!" },
    { status: 201 }
  );
}
