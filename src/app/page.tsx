import { Container } from "@chakra-ui/react";
import ListPost from "./ui/ListPost";
import TitlePage from "./ui/TitlePage";

export default function HomePage() {
  return (
    <main>
      <Container>
        <TitlePage />
        <ListPost />
      </Container>
    </main>
  );
}
