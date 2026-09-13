"use client"

import { Button, Dialog, Field, Input, Portal, Stack, Textarea } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toaster } from "@/components/ui/toaster"
import { Post } from "../../../../generated/prisma/client"

interface ModalEditPostProps {
    post: Post
    authorId: string | null
}

const ModalEditPost: React.FC<ModalEditPostProps> = ({ post, authorId }) => {
    const queryClient = useQueryClient()
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState(post.title)
    const [text, setText] = useState(post.text)

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/post/${post.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, text }),
            })
            const body = await res.json()
            if (!res.ok) throw new Error(body.error ?? "Erro ao atualizar o post.")
            return body
        },
        onSuccess: (body) => {
            queryClient.invalidateQueries({ queryKey: ["postsByAuthorId", authorId] })
            toaster.create({ type: "success", description: body.message ?? "Post atualizado com sucesso!" })
            setOpen(false)
        },
        onError: (error: Error) => {
            toaster.create({ type: "error", description: error.message })
        },
    })

    return (
        <Dialog.Root open={open} onOpenChange={(details) => setOpen(details.open)}>
            <Dialog.Trigger asChild>
                <Button size="sm" variant="outline">Editar</Button>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Editar postagem</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body pb="4">
                            <Stack gap="4">
                                <Field.Root>
                                    <Field.Label>Título</Field.Label>
                                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                                </Field.Root>
                                <Field.Root>
                                    <Field.Label>Conteúdo</Field.Label>
                                    <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} />
                                </Field.Root>
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline">Cancelar</Button>
                            </Dialog.ActionTrigger>
                            <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>Salvar</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default ModalEditPost;
