import "server-only"
import { cookies } from "next/headers"
import { cache } from "react"
import { decrypt } from "./session"
import { redirect } from "next/navigation"
import { db } from "./prisma"
import { SessionPayload } from "./definition"
import { User } from "../../generated/prisma/client"

export const verifySession = cache(async () => {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) return null;

    return session;
})

/**
 * Como verifySession(), mas sem redirecionar. Use em componentes públicos
 * (ex.: um header que aparece em toda página) onde não ter sessão é um
 * estado normal, não um erro — verifySession() é para rotas que exigem login.
 */
export const getSession = cache(async (): Promise<User | null> => {
    const cookie = (await cookies()).get('session')?.value
    const session = await decrypt(cookie)

    if (!session?.userId) return null

    const user = await db.user.findFirst({ where: { id: session.userId } })

    if (!user) return null;

    return user;
})
