import * as z from 'zod'
import { Category, Role } from '../../generated/prisma/client'

export type FormState =
    | {
        errors?: {
            name?: string[]
            email?: string[]
            password?: string[]
            confirmPassword?: string[]
            title?: string[]
            text?: string[]
            category?: string[]
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
});

export const FirstAccessFormSchema = z.object({
    email: z.email('Informe um e-mail válido.').trim(),
    currentPassword: z.string().trim().min(1, 'Informe a senha atual.'),
    // trim antes do min: uma senha só de espaços não pode passar.
    password: z.string().trim().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
    confirmPassword: z.string().trim(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
});

export const StudentSignUpFormSchema = z.object({
    name: z.string().trim().min(1, 'Informe o nome.'),
    email: z.email('Informe um e-mail válido.').trim(),
    // trim antes do min: uma senha só de espaços não pode passar.
    password: z.string().trim().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
    confirmPassword: z.string().trim(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
});

// Senha nova é opcional: só é validada se `password` ou `confirmPassword`
// vier com texto (depois do trim).
export const StudentProfileFormSchema = z.object({
    name: z.string().trim().min(1, 'Informe o nome.'),
    email: z.email('Informe um e-mail válido.').trim(),
    currentPassword: z.string().optional(),
    password: z.string().trim().optional(),
    confirmPassword: z.string().trim().optional(),
}).superRefine((data, ctx) => {
    const password = data.password ?? '';
    const confirmPassword = data.confirmPassword ?? '';
    if (!password && !confirmPassword) return;

    if (password.length < 8) {
        ctx.addIssue({ code: 'custom', message: 'A senha deve ter pelo menos 8 caracteres.', path: ['password'] });
    }
    if (password !== confirmPassword) {
        ctx.addIssue({ code: 'custom', message: 'As senhas não coincidem.', path: ['confirmPassword'] });
    }
});

export const CreatePostFormSchema = z.object({
    title: z.string().min(1, 'Informe o título.').trim(),
    text: z.string().min(1, 'Informe o conteúdo do post.').trim(),
    category: z.enum(Category, 'Categoria inválida.').optional(),
});

export const CommentFormSchema = z.object({
    // error: mensagem também quando text não é string (ausente, número...).
    text: z.string({ error: 'Escreva o comentário.' })
        .trim()
        .min(1, 'Escreva o comentário.')
        .max(1000, 'O comentário pode ter até 1000 caracteres.'),
});
