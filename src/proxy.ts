import { Role } from "../generated/prisma/client"
import { SessionPayload } from "@/lib/definition"
import { decrypt } from "@/lib/session"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

// '/' é pública para todos (ADMIN, AUTHOR, STUDENT ou visitante sem sessão).
// Só as áreas abaixo exigem um papel específico — qualquer rota fora delas
// segue liberada.
const ROLE_ROUTES: { prefix: string; role: Role }[] = [
    { prefix: "/admin", role: Role.ADMIN },
    { prefix: "/area-professor", role: Role.AUTHOR },
]

export default async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname

    const restrictedRoute = ROLE_ROUTES.find(
        ({ prefix }) => path === prefix || path.startsWith(`${prefix}/`)
    )

    if (!restrictedRoute) {
        return NextResponse.next()
    }

    const cookieStore = await cookies()
    const session = await decrypt<SessionPayload>(cookieStore.get("session")?.value)

    if (session?.role !== restrictedRoute.role) {
        return NextResponse.redirect(new URL("/", req.nextUrl))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
