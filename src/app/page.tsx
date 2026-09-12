import { Container } from "@chakra-ui/react";
import ListPost from "./ui/ListPost";
import TitlePage from "./ui/TitlePage";
// import { getAllPosts } from "@/actions/post";
// import { getAllAuthors } from "@/actions/author";

export default async function HomePage() {
  // const [posts, authors] = await Promise.all([getAllPosts(), getAllAuthors()]);

  return (
    <main>
      <Container>
        <TitlePage />
        {/* <ListPost data={[]} authors={[]} /> */}
      </Container>
    </main>
  );
}
