'use server'
import { FormState, LoginFormSchema } from '@/lib/definition'
import { db } from '@/lib/prisma'
import { createSession, deleteSession } from '@/lib/session'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

export async function login(state: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = LoginFormSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors }
    }

    const { email, password } = validatedFields.data

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
        return { ok: false, message: 'E-mail ou senha inválidos.' }
    }

    const passwordMatch = await bcrypt.compare(password, user.hash)
    if (!passwordMatch) {
        return { ok: false, message: 'E-mail ou senha inválidos.' }
    }

    await createSession(user.id, user.role);
}


export async function logout() {
    await deleteSession()
    redirect('/')
}