"use client"

import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toaster } from "@/components/ui/toaster"
import { Post } from "../../../../generated/prisma/client"
import ModalEditPost from "./ModalEditPost"
import { getPostsByAuthorId } from "@/services/post"


const ListPostsAuthor: React.FC<{ authorId: string | null }> = ({ authorId }) => {
    const queryClient = useQueryClient()

    const { data } = useQuery<Post[]>({ queryKey: ['postsByAuthorId', authorId], queryFn: () => getPostsByAuthorId(authorId) })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/post/${id}`, { method: "DELETE" })
            const body = await res.json()
            if (!res.ok) throw new Error(body.error ?? "Erro ao excluir o post.")
            return body
        },
        onSuccess: (body) => {
            queryClient.invalidateQueries({ queryKey: ["postsByAuthorId", authorId] })
            toaster.create({ type: "success", description: body.message ?? "Post removido com sucesso!" })
        },
        onError: (error: Error) => {
            toaster.create({ type: "error", description: error.message })
        },
    });

    function handleDelete(id: string, title: string) {
        if (!window.confirm(`Tem certeza que deseja excluir o post "${title}"?`)) return
        deleteMutation.mutate(id)
    }

    return (
        <Stack mx="24px" gap={3} mt={5}>
            {data?.length === 0 && (
                <Text color="fg.muted">Nenhum post encontrado para este professor.</Text>
            )}
            { data && data?.map((item) => (
                <Box border="sm" p={4} px={10} key={item.id}>
                    <Text fontSize="lg" fontWeight={600} mb={3}>{item.title}</Text>
                    <Text fontSize="sm" lineClamp="2" mb={3}>{item.text}</Text>
                    <Flex gap={3} justify="end">
                        <ModalEditPost post={item} authorId={authorId} />
                        <Button
                            size="sm"
                            colorPalette="red"
                            variant="outline"
                            loading={deleteMutation.isPending && deleteMutation.variables === item.id}
                            onClick={() => handleDelete(item.id, item.title)}
                        >
                            Excluir
                        </Button>
                    </Flex>
                </Box>
            ))}
        </Stack>
    )
}

export default ListPostsAuthor;
