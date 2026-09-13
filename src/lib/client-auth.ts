"use client"

import type { useRouter } from "next/navigation"

/**
 * Encerra a sessão via /api/auth/logout e volta pra "/".
 * Recebe o router de quem chama (não é um hook, não pode chamar useRouter
 * sozinho) e sempre chama refresh() em seguida, pra nenhum Server Component
 * ficar servindo dado em cache da sessão que acabou de ser encerrada.
 */
export async function logout(router: ReturnType<typeof useRouter>) {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
}
