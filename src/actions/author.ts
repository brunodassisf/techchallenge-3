'use server'

import { prisma } from "@/lib/prisma";
import { Author } from "../../generated/prisma/client";

export async function getAllAuthors(): Promise<Author[]> {
    const authors = await prisma.author.findMany();
    return authors;
}
