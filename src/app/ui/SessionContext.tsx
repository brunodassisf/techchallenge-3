"use client"

import { createContext, useContext } from "react"
import { Role } from "../../../generated/prisma/client"

export interface SessionData {
    name: string
    role: Role
}

const SessionContext = createContext<SessionData | null>(null)

interface SessionProviderProps {
    value: SessionData
    children: React.ReactNode
}

export function SessionProvider({ value, children }: SessionProviderProps) {
    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    )
}

export function useSession(): SessionData {
    const context = useContext(SessionContext)
    if (!context) {
        throw new Error("useSession deve ser usado dentro de um SessionProvider")
    }
    return context
}
