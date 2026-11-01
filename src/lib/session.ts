import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { SessionPayload } from './definition'

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

// Por padrão o cookie é "secure" em produção (exige HTTPS). Em ambientes de
// produção servidos por HTTP puro — como o container Docker local — defina
// COOKIE_SECURE=false para que o navegador aceite o cookie de sessão.
const secureCookie = process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === 'true'
    : process.env.NODE_ENV === 'production'

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encodedKey)
}

// Genérico (com SessionPayload como padrão) pra servir tanto a sessão da
// loja quanto a do cliente, sem duplicar a verificação do JWT — só muda o
// formato do payload esperado de volta.
export async function decrypt<T extends SessionPayload>(
    session: string | undefined = '',
) {
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ['HS256'],
        })
        return payload as T
    } catch {
        return null
    }
}

export async function createSession(userId: string, role: SessionPayload['role']) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const session = await encrypt({ userId, role, expiresAt })
    const cookieSession = await cookies()

    cookieSession.set('session', session, {
        httpOnly: true,
        secure: secureCookie,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    })
}

export async function updateSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    const payload = await decrypt(session)

    if (!session || !payload) return null

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    cookieStore.set('session', session, {
        httpOnly: true,
        secure: secureCookie,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    })
}

export async function deleteSession() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
}
