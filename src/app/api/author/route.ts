import { db } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { CreateAuthorFormSchema } from "@/lib/definition";
import { Role } from "../../../../generated/prisma/client";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function GET() {
  const authors = await db.author.findMany();

  return NextResponse.json(authors);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (session?.role !== Role.ADMIN) {
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

  const { name, email, password } = validatedFields.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Já existe uma conta com esse e-mail." },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password, 10);

  const user = await db.user.create({
    data: { name, email, hash: passwordHash, role: Role.AUTHOR },
  });

  const author = await db.author.create({ data: { name, userId: user.id } });

  return NextResponse.json(
    { data: author, message: "Professor cadastrado com sucesso!" },
    { status: 201 }
  );
}
