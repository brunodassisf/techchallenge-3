import { Container } from "@chakra-ui/react";
import TitlePage from "../ui/TitlePage";
import ListAuthor from "./ui/ListAuthor";

export default function AdminDashboardPage() {
    return (
        <main>
            <Container>
                <TitlePage />
                <ListAuthor />
            </Container>
        </main>
    )
}