import { Container } from "@chakra-ui/react";

import { getAllPosts, getPostId } from "@/actions/post";
import TitlePage from "../ui/TitlePage";
import ViewPost from "./ui/ViewPost";
import { redirect } from "next/navigation";

export default async function PostPage({
    params,
}: Readonly<{
    params: Promise<{ post: string }>;
}>) {
    const { post: postId } = await params;
    const post = await getPostId(postId);

    if (!post) {
        redirect('/');
    }

    return (
        <main>
            <Container>
                <TitlePage />
                <ViewPost data={post} />
            </Container>
        </main>
    );
}
