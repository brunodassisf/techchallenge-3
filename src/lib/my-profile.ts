import { db } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { StudentProfileFormSchema } from "@/lib/definition";
import { Prisma, type Role, type User } from "../../generated/prisma/client";
import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";

const EMAIL_TAKEN = { error: "Já existe uma conta com esse e-mail." };

/** Usuário da sessão, se tiver o papel pedido; senão, a resposta de erro (401/403). */
export async function getMeUser(role: Role, forbidden: string): Promise<User | NextResponse> {
  // getSession() já busca o User no banco: conta excluída ou desativada → null.
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });
  }
  if (user.role !== role) {
    return NextResponse.json({ error: forbidden }, { status: 403 });
  }
  return user;
}

/**
 * Edita nome, e-mail e senha do usuário logado. Trocar e-mail ou senha exige
 * a senha atual. Erro na senha atual é 400, não 401: o app trata 401 como
 * sessão vencida e desloga a pessoa.
 *
 * `renameProfile` atualiza o nome no perfil do papel (Student/Author), na
 * mesma transação do User.
 */
export async function updateMe(
  user: User,
  request: Request,
  renameProfile: (name: string) => Prisma.PrismaPromise<unknown>,
  authorId: string | null
) {
  const body = await request.json().catch(() => null);
  const validatedFields = StudentProfileFormSchema.safeParse(body);

  if (!validatedFields.success) {
    return NextResponse.json(
      { errors: validatedFields.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, password } = validatedFields.data;
  // trim: o login aplica trim na senha, então o hash salvo é do valor sem espaços.
  const currentPassword = validatedFields.data.currentPassword?.trim();
  const emailChanged = email !== user.email;

  if (emailChanged || password) {
    if (!currentPassword) {
      return NextResponse.json(
        { errors: { currentPassword: ["Informe a senha atual."] } },
        { status: 400 }
      );
    }
    if (!(await compare(currentPassword, user.hash))) {
      return NextResponse.json(
        { errors: { currentPassword: ["Senha atual incorreta."] } },
        { status: 400 }
      );
    }
  }

  if (emailChanged) {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(EMAIL_TAKEN, { status: 409 });
    }
  }

  const data = { name, email, ...(password ? { hash: await hash(password, 10) } : {}) };

  let updated;
  for (let attempt = 1; !updated; attempt++) {
    try {
      [updated] = await db.$transaction([
        db.user.update({ where: { id: user.id }, data }),
        renameProfile(name),
      ]);
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError)) throw error;
      // Corrida: outra conta pegou o e-mail entre a checagem e o update.
      if (error.code === "P2002") {
        return NextResponse.json(EMAIL_TAKEN, { status: 409 });
      }
      // No MongoDB, duas transações gravando o mesmo e-mail ao mesmo tempo
      // dão write conflict (P2034) antes do P2002: tenta de novo, e a nova
      // tentativa recebe o P2002 se a outra conta ficou com o e-mail.
      if (error.code !== "P2034" || attempt === 3) throw error;
    }
  }

  return NextResponse.json({
    user: { id: updated.id, name: updated.name, role: updated.role, authorId },
  });
}
