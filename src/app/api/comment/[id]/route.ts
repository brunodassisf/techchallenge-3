import { db } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { isObjectId } from "@/lib/object-id";
import { commentSelect } from "@/lib/comment";
import { CommentFormSchema } from "@/lib/definition";
import { Role } from "../../../../../generated/prisma/client";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

const notFound = () =>
  NextResponse.json({ error: "Comentário não encontrado." }, { status: 404 });

const unauthorized = () =>
  NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });

function findComment(id: string) {
  return isObjectId(id)
    ? db.comment.findUnique({
        where: { id },
        include: {
          student: { select: { userId: true } },
          post: { select: { authorId: true } },
        },
      })
    : null;
}

/** Só o estudante dono edita. */
export async function PUT(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return unauthorized();

  const comment = await findComment((await params).id);
  if (!comment) return notFound();

  if (comment.student.userId !== session.id) {
    return NextResponse.json(
      { error: "Você não tem permissão para editar este comentário." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const validatedFields = CommentFormSchema.safeParse(body);
  if (!validatedFields.success) {
    return NextResponse.json(
      { errors: validatedFields.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const updated = await db.comment.update({
    where: { id: comment.id },
    data: { text: validatedFields.data.text },
    select: commentSelect,
  });

  return NextResponse.json({ data: updated, message: "Comentário atualizado!" });
}

/** Excluem: o dono, o professor dono do post e o ADMIN. */
export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return unauthorized();

  const comment = await findComment((await params).id);
  if (!comment) return notFound();

  const allowed =
    comment.student.userId === session.id ||
    session.role === Role.ADMIN ||
    (await db.author.findUnique({ where: { userId: session.id } }))?.id === comment.post.authorId;

  if (!allowed) {
    return NextResponse.json(
      { error: "Você não tem permissão para excluir este comentário." },
      { status: 403 }
    );
  }

  await db.comment.delete({ where: { id: comment.id } });

  return NextResponse.json({ message: "Comentário removido!" });
}
