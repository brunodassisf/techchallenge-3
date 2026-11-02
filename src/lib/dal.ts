import "server-only"
import { cookies, headers } from "next/headers"
import { cache } from "react"
import { decrypt } from "./session"
import { db } from "./prisma"
import { User } from "../../generated/prisma/client"

/**
 * Lê o JWT da requisição atual. Aceita dois formatos:
 * - header `Authorization: Bearer <token>` — clientes externos (Postman, mobile, outros serviços);
 * - cookie `session` — front-end Next (definido no login).
 * O header tem prioridade quando os dois estão presentes.
 */
async function getRequestToken() {
    const authorization = (await headers()).get('authorization')
    const [scheme, token] = authorization?.split(' ') ?? []
    if (scheme?.toLowerCase() === 'bearer' && token) return token.trim()

    return (await cookies()).get('session')?.value
}

export const verifySession = cache(async () => {
    const session = await decrypt(await getRequestToken());

    if (!session?.userId) return null;

    return session;
})

/**
 * Como verifySession(), mas sem redirecionar. Use em componentes públicos
 * (ex.: um header que aparece em toda página) onde não ter sessão é um
 * estado normal, não um erro — verifySession() é para rotas que exigem login.
 */
export const getSession = cache(async (): Promise<User | null> => {
    const session = await decrypt(await getRequestToken())

    if (!session?.userId) return null

    const user = await db.user.findFirst({ where: { id: session.userId } })

    if (!user) return null;

    return user;
})
