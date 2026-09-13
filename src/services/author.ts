import { Author } from "../../generated/prisma/client";

export const getAuthors = async (): Promise<Author[]> => {
    const data = await fetch(`/api/author`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
    return data.json();
}