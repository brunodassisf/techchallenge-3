import { Container, Tabs } from "@chakra-ui/react";
import TitlePage from "../ui/TitlePage";
import ListAuthor from "./ui/ListAuthor";
import ListStudent from "./ui/ListStudent";
import { getAuthor } from "@/actions/author";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/prisma";
import { Role } from "../../../generated/prisma/client";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
    const session = await getSession();
    // O proxy só valida o JWT; aqui a página também lê dados de estudantes direto do banco.
    if (session?.role !== Role.ADMIN) redirect("/");

    const [authors, students] = await Promise.all([
        getAuthor(),
        db.student.findMany({ orderBy: { name: "asc" } }),
    ]);

    return (
        <main>
            <Container>
                <TitlePage />
                <Tabs.Root defaultValue="professores" mt={4}>
                    <Tabs.List>
                        <Tabs.Trigger value="professores">Professores ({authors.length})</Tabs.Trigger>
                        <Tabs.Trigger value="estudantes">Estudantes ({students.length})</Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="professores">
                        <ListAuthor data={authors} />
                    </Tabs.Content>
                    <Tabs.Content value="estudantes">
                        <ListStudent data={students} />
                    </Tabs.Content>
                </Tabs.Root>
            </Container>
        </main>
    )
}
