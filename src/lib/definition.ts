import * as z from 'zod'
import { Role } from '../../generated/prisma/client'

export type FormState =
    | {
        errors?: {
            name?: string[]
            email?: string[]
            password?: string[]
            confirmPassword?: string[]
        }
        ok?: boolean
        message?: string
    }
    | undefined

export type SessionPayload = {
    userId: string
    role: Role
    expiresAt: Date
}

export const LoginFormSchema = z.object({
    email: z.email('Informe um e-mail válido.').trim(),
    password: z.string().min(1, 'Informe a senha.').trim(),
});