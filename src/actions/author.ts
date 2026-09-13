'use server'

import { serverFetch } from '@/lib/api'
import { Author } from '../../generated/prisma/client'

export async function getAuthor(): Promise<Author[]> {
    const res = await serverFetch('/api/author')
    if (!res.ok) return []
    return res.json()
}
