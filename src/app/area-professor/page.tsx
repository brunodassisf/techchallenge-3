import { Container } from "@chakra-ui/react";
import TitlePage from "../ui/TitlePage";
import ModalCreatePost from "./ui/ModalCreatePost";
import ListPostsAuthor from "./ui/ListPostsAuthor";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProfessorDashboardPage() {
    const session = await getSession();
    // O proxy só valida o JWT; getSession() também barra conta desativada.
    if (!session) redirect("/");

    const authorId = await db.author.findUnique({ where: { userId: session.id } }).then((res) => res?.id ?? null);

    return (
        <main>
            <Container>
                <TitlePage />
                <ModalCreatePost authorId={authorId} />
                <ListPostsAuthor authorId={authorId} />
            </Container>
        </main>
    )
}