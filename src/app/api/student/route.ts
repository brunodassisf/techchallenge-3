import { db } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { StudentSignUpFormSchema } from "@/lib/definition";
import { loginSuccessResponse } from "@/lib/login-response";
import { Prisma, Role } from "../../../../generated/prisma/client";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

const EMAIL_TAKEN = { error: "Já existe uma conta com esse e-mail." };

/** Só ADMIN. Lista os estudantes com o e-mail da conta, por nome. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });
  }
  if (session.role !== Role.ADMIN) {
    return NextResponse.json(
      { error: "Apenas administradores podem ver os estudantes." },
      { status: 403 }
    );
  }

  const students = await db.student.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(
    students.map((s) => ({ id: s.id, name: s.name, email: s.user.email, createdAt: s.createdAt }))
  );
}

/**
 * Cadastro público de estudante. O estudante escolhe a senha aqui (sem senha
 * padrão nem primeiro acesso) e já sai logado: a resposta é a mesma do login,
 * com status 201.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const validatedFields = StudentSignUpFormSchema.safeParse(body);

  if (!validatedFields.success) {
    return NextResponse.json(
      { errors: validatedFields.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, password } = validatedFields.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(EMAIL_TAKEN, { status: 409 });
  }

  let user;
  try {
    // Create aninhado: User e Student nascem juntos, sem User órfão.
    user = await db.user.create({
      data: {
        name,
        email,
        hash: await hash(password, 10),
        role: Role.STUDENT,
        students: { create: { name } },
      },
    });
  } catch (error) {
    // Cadastro simultâneo com o mesmo e-mail: o índice único barra o segundo.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(EMAIL_TAKEN, { status: 409 });
    }
    throw error;
  }

  return loginSuccessResponse(user, { status: 201 });
}
