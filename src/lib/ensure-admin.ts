import { hash } from "bcryptjs";
import { db } from "@/lib/prisma";
import { Role } from "../../generated/prisma/client";

/**
 * Cria o ADMIN inicial a partir de ADMIN_EMAIL/ADMIN_PASSWORD/ADMIN_NAME, só se
 * ainda não houver nenhum ADMIN no banco. Com um ADMIN existente, não faz nada
 * (não troca nome nem senha).
 */
export async function ensureAdmin() {
  if (await db.user.findFirst({ where: { role: Role.ADMIN }, select: { id: true } })) return;

  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const name = process.env.ADMIN_NAME?.trim();
  if (!email || !password || !name) {
    console.warn("Nenhum ADMIN no banco: defina ADMIN_EMAIL, ADMIN_PASSWORD e ADMIN_NAME para criá-lo.");
    return;
  }

  if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
    console.warn(`Nenhum ADMIN no banco, mas o e-mail ${email} já é de outra conta: admin não criado.`);
    return;
  }

  // trim na senha: o login aplica trim na senha digitada.
  await db.user.create({ data: { name, email, hash: await hash(password, 10), role: Role.ADMIN } });
  console.log(`Admin criado: ${name} <${email}>`);
}
