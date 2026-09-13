import { Container } from "@chakra-ui/react";
import TitlePage from "../ui/TitlePage";
import ListAuthor from "./ui/ListAuthor";
import { getAuthor } from "@/actions/author";

export default async function AdminDashboardPage() {

    const authors = await getAuthor();
    return (
        <main>
            <Container>
                <TitlePage />
                <ListAuthor data={authors} />
            </Container>
        </main>
    )
}