import { LoginFormSchema } from "@/lib/definition";
import { db } from "@/lib/prisma";
import { loginSuccessResponse } from "@/lib/login-response";
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

  // Checado só depois da senha, para não revelar se o e-mail existe.
  if (user.deactivatedAt) {
    return NextResponse.json(
      { error: "Conta desativada. Fale com a coordenação." },
      { status: 403 }
    );
  }

  // Sem sessão: a conta com senha padrão não acessa nenhuma rota protegida.
  if (user.firstAccess === true) {
    return NextResponse.json(
      { error: "Primeiro acesso: defina sua senha no app.", code: "FIRST_ACCESS_REQUIRED" },
      { status: 403 }
    );
  }

  return loginSuccessResponse(user);
}
