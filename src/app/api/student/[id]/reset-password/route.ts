import { db } from "@/lib/prisma";
import { adminStudent } from "@/lib/admin-student";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

/** Volta a conta para a senha padrão; o estudante cria outra no primeiro acesso. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const student = await adminStudent((await params).id);
  if (student instanceof NextResponse) return student;

  // trim: o login aplica trim na senha digitada, então o hash é do valor sem espaços.
  const defaultPassword = process.env.DEFAULT_TEACHER_PASSWORD?.trim();
  if (!defaultPassword || defaultPassword.length < 8) {
    return NextResponse.json({ error: "Senha padrão não configurada no servidor." }, { status: 500 });
  }

  await db.user.update({
    where: { id: student.userId },
    data: { hash: await hash(defaultPassword, 10), firstAccess: true },
  });

  return NextResponse.json({ message: "Senha resetada." });
}
