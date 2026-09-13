import * as z from 'zod'
import { Role } from '../../generated/prisma/client'

export type FormState =
    | {
        errors?: {
            name?: string[]
            email?: string[]
            password?: string[]
            confirmPassword?: string[]
            title?: string[]
            text?: string[]
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

export const CreateAuthorFormSchema = z.object({
    name: z.string().min(1, 'Informe o nome.').trim(),
    email: z.email('Informe um e-mail válido.').trim(),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.').trim(),
});

export const CreatePostFormSchema = z.object({
    title: z.string().min(1, 'Informe o título.').trim(),
    text: z.string().min(1, 'Informe o conteúdo do post.').trim(),
});