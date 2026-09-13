'use server'

import { serverFetch } from '@/lib/api'
import { Prisma } from '../../generated/prisma/client'

export type PostWithAuthor = Prisma.PostGetPayload<{
    include: { authors: true };
}>;

export async function getAllPosts(): Promise<PostWithAuthor[]> {
    const res = await serverFetch('/api/post')
    if (!res.ok) return []
    return res.json()
}

export async function getPostId(id: string): Promise<PostWithAuthor | null> {
    const res = await serverFetch(`/api/post/${id}`)
    if (!res.ok) return null
    return res.json()
}
