import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient, Role } from "../generated/prisma/client";

const prisma = new PrismaClient();

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(
            `Variável de ambiente '${name}' não definida. Configure ADMIN_EMAIL, ADMIN_PASSWORD e ADMIN_NAME no seu .env antes de rodar o seed.`
        );
    }
    return value;
}

async function main() {
    const email = requireEnv("ADMIN_EMAIL");
    const password = requireEnv("ADMIN_PASSWORD");
    const name = requireEnv("ADMIN_NAME");

    const passwordHash = await hash(password, 10);

    // Idempotente: se o admin já existir (mesmo e-mail), só atualiza nome/senha/role em vez de duplicar.
    const admin = await prisma.user.upsert({
        where: { email },
        update: { name, hash: passwordHash, role: Role.ADMIN },
        create: { name, email, hash: passwordHash, role: Role.ADMIN },
    });

    console.log(`Admin pronto: ${admin.name} <${admin.email}> (role: ${admin.role})`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
