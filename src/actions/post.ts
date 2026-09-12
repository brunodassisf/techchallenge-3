// 'use server'

// import { prisma, Prisma } from "@/lib/prisma";

// export type PostWithAuthor = Prisma.PostGetPayload<{
//     include: { authors: true };
// }>;

// export async function getAllPosts(): Promise<PostWithAuthor[]> {
//     const posts = await prisma.post.findMany({
//         include: { authors: true },
//     });
//     return posts;
// }


// export async function getPostId(id: string): Promise<PostWithAuthor | null> {
//     const post = await prisma.post.findFirst({
//         where: { id },
//         include: { authors: true },
//     });
//     return post;
// }