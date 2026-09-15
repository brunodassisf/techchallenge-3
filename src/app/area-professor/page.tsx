import { Container } from "@chakra-ui/react";
import TitlePage from "../ui/TitlePage";
import ModalCreatePost from "./ui/ModalCreatePost";
import ListPostsAuthor from "./ui/ListPostsAuthor";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/prisma";

export default async function ProfessorDashboardPage() {
    const session = await getSession();
    const authorId = session ? await db.author.findUnique({ where: { userId: session.id } }).then((res) => res?.id as string) : null;

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