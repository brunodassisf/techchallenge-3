import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

/**
 * Define `category: "GERAL"` em todo post criado antes de o campo existir.
 *
 * No MongoDB o `@default(GERAL)` do schema não altera documentos já gravados:
 * o Prisma até devolve "GERAL" na leitura, mas o campo não existe no banco,
 * então filtros como `where: { category: "GERAL" }` não encontram esses posts.
 *
 * Idempotente: só toca documentos sem o campo, então pode rodar quantas vezes
 * for preciso.
 */
async function main() {
    const result = await prisma.$runCommandRaw({
        update: "Post",
        updates: [
            {
                q: { category: { $exists: false } },
                u: { $set: { category: "GERAL" } },
                multi: true,
            },
        ],
    });

    console.log(`Backfill de category concluído: ${result.nModified ?? 0} post(s) atualizado(s).`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
