import { LoginFormSchema } from "@/lib/definition";
import { db } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { NextResponse } from "next/server";
import { compare } from "bcryptjs";

export async function POST(request: Request) {
  const body = await request.json();
  const validatedFields = LoginFormSchema.safeParse(body);

  if (!validatedFields.success) {
    return NextResponse.json(
      { errors: validatedFields.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, password } = validatedFields.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const passwordMatch = await compare(password, user.hash);
  if (!passwordMatch) {
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  await createSession(user.id, user.role);

  return NextResponse.json({ message: "Login realizado com sucesso!" });
}
