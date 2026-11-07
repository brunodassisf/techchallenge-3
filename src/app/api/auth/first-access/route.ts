import { FirstAccessFormSchema } from "@/lib/definition";
import { loginSuccessResponse } from "@/lib/login-response";
import { db } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/first-access — pública. O professor troca a senha padrão pela
 * própria e já sai logado (mesma resposta do login). A ordem das checagens
 * importa: nada sobre a conta é revelado antes de a senha atual ser conferida.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const validatedFields = FirstAccessFormSchema.safeParse(body);

  if (!validatedFields.success) {
    return NextResponse.json(
      { errors: validatedFields.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, currentPassword, password } = validatedFields.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await compare(currentPassword, user.hash))) {
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  if (user.deactivatedAt) {
    return NextResponse.json(
      { error: "Conta desativada. Fale com a coordenação." },
      { status: 403 }
    );
  }

  if (user.firstAccess !== true) {
    return NextResponse.json(
      { error: "A senha já foi definida. Entre com sua senha." },
      { status: 409 }
    );
  }

  if (password === currentPassword) {
    return NextResponse.json(
      { errors: { password: ["Escolha uma senha diferente da senha padrão."] } },
      { status: 400 }
    );
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: { hash: await hash(password, 10), firstAccess: false },
  });

  return loginSuccessResponse(updated);
}
