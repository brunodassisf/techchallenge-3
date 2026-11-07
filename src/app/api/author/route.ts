import { db } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { authorSummaryInclude, toAuthorSummary } from "@/lib/author-summary";
import { CreateAuthorFormSchema } from "@/lib/definition";
import { Role } from "../../../../generated/prisma/client";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

/** Pública (a home usa para o filtro por autor). Cada item traz `postCount` e `active`. */
export async function GET() {
  const authors = await db.author.findMany({
    include: authorSummaryInclude,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(authors.map(toAuthorSummary));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });
  }
  if (session.role !== Role.ADMIN) {
    return NextResponse.json(
      { error: "Apenas administradores podem cadastrar professores." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const validatedFields = CreateAuthorFormSchema.safeParse(body);

  if (!validatedFields.success) {
    return NextResponse.json(
      { errors: validatedFields.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email } = validatedFields.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Já existe uma conta com esse e-mail." },
      { status: 409 }
    );
  }

  // trim: o login aplica trim na senha digitada, então o hash precisa ser do
  // valor sem espaços nas pontas.
  const defaultPassword = process.env.DEFAULT_TEACHER_PASSWORD?.trim();
  if (!defaultPassword || defaultPassword.length < 8) {
    return NextResponse.json(
      { error: "Senha padrão não configurada no servidor." },
      { status: 500 }
    );
  }

  const passwordHash = await hash(defaultPassword, 10);

  const user = await db.user.create({
    data: { name, email, hash: passwordHash, role: Role.AUTHOR, firstAccess: true },
  });

  const author = await db.author.create({ data: { name, userId: user.id } });

  return NextResponse.json(
    { data: author, message: "Professor cadastrado com sucesso!" },
    { status: 201 }
  );
}
