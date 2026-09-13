import { Post } from "../../generated/prisma/browser";

export const getPosts = async (authorId: string, search: string): Promise<Post[]> => {
    const params = new URLSearchParams();
    if (authorId) params.set("authorId", authorId);
    if (search) params.set("q", search);

    const data = await fetch(`/api/post?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
    return data.json();
}


export const getPostsByAuthorId = async (authorId: string | null): Promise<Post[]> => {
    if (!authorId) return [];

    const data = await fetch(`/api/post?${new URLSearchParams({ authorId })}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })

    return data.json();
}