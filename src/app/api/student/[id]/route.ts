import { db } from "@/lib/prisma";
import { adminStudent } from "@/lib/admin-student";
import { CreateAuthorFormSchema } from "@/lib/definition";
import { Prisma } from "../../../../../generated/prisma/client";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

const EMAIL_TAKEN = { error: "Já existe uma conta com esse e-mail." };

/** Admin edita nome e e-mail do estudante. A senha não muda. */
export async function PUT(request: Request, { params }: Params) {
  const student = await adminStudent((await params).id);
  if (student instanceof NextResponse) return student;

  const body = await request.json().catch(() => null);
  const validatedFields = CreateAuthorFormSchema.safeParse(body);
  if (!validatedFields.success) {
    return NextResponse.json(
      { errors: validatedFields.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const { name, email } = validatedFields.data;

  if (email !== student.user.email) {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json(EMAIL_TAKEN, { status: 409 });
  }

  try {
    await db.$transaction([
      db.user.update({ where: { id: student.userId }, data: { name, email } }),
      db.student.update({ where: { id: student.id }, data: { name } }),
    ]);
  } catch (error) {
    // Troca simultânea para o mesmo e-mail: o índice único barra a segunda.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(EMAIL_TAKEN, { status: 409 });
    }
    throw error;
  }

  return NextResponse.json({ data: { id: student.id, name, email, createdAt: student.createdAt } });
}

/** Apaga o estudante e a conta de login juntos. */
export async function DELETE(_request: Request, { params }: Params) {
  const student = await adminStudent((await params).id);
  if (student instanceof NextResponse) return student;

  await db.$transaction([
    db.student.delete({ where: { id: student.id } }),
    db.user.delete({ where: { id: student.userId } }),
  ]);

  return NextResponse.json({ message: "Estudante excluído." });
}
