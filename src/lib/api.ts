import "server-only"
import { cookies, headers } from "next/headers"

async function getBaseUrl() {
    const headersList = await headers()
    const host = headersList.get("host")
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
    return `${protocol}://${host}`
}

/**
 * fetch() para as próprias rotas /api, a partir de Server Components/Actions.
 *
 * Duas diferenças em relação a um fetch comum:
 * - o servidor não aceita caminho relativo (só o browser aceita), então
 *   montamos a URL absoluta a partir do host da requisição atual;
 * - um fetch feito do servidor não carrega os cookies da requisição
 *   original sozinho (diferente do fetch do browser) — por isso repassamos
 *   o cookie de sessão manualmente, senão a rota nunca reconheceria o
 *   usuário logado.
 */
export async function serverFetch(path: string, init?: RequestInit) {
    const [baseUrl, cookieHeader] = await Promise.all([
        getBaseUrl(),
        cookies().then((store) => store.toString()),
    ])

    return fetch(`${baseUrl}${path}`, {
        ...init,
        cache: "no-store",
        headers: {
            ...init?.headers,
            Cookie: cookieHeader,
        },
    })
}
