"use client"

import { FormState } from "@/lib/definition"
import { toaster } from "@/components/ui/toaster"
import { Box, Button, Dialog, Field, Flex, Input, Portal, Stack, Textarea } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState } from "react"

const ModalCreatePost: React.FC = () => {
    const router = useRouter()
    const [open, setOpen] = useState(false)

    async function createPost(_prevState: FormState, formData: FormData): Promise<FormState> {
        const res = await fetch("/api/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: formData.get("title"),
                text: formData.get("text"),
            }),
        })
        const body = await res.json()

        if (!res.ok) {
            if (body.errors) return { errors: body.errors }
            return { ok: false, message: body.error ?? "Erro ao criar o post." }
        }

        setOpen(false)
        router.refresh()
        return { ok: true, message: body.message }
    }

    const [state, action, pending] = useActionState(createPost, undefined);
    const toggleModal = () => setOpen(!open)

    useEffect(() => {
        if (!state?.errors && !state?.message) return
        const timeout = setTimeout(() => {
            const description = state.errors
                ? Object.values(state.errors).flat().join("\n")
                : state.message
            toaster.create({
                type: state.ok ? "success" : "error",
                description,
            })
        }, 0);
        return () => clearTimeout(timeout);
    }, [state]);

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(details) => setOpen(details.open)}
        >
            <Dialog.Trigger asChild>
                <Flex justify="end" mt={5}>
                    <Button>Criar Post</Button>
                </Flex>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <form action={action}>
                            <Dialog.Header>
                                <Dialog.Title>Criar postagem</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body pb="4">
                                <Stack gap="4">
                                    <Field.Root>
                                        <Field.Label>Título</Field.Label>
                                        <Input
                                            name="title"
                                            placeholder="Título do post"
                                        />
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label>Conteúdo</Field.Label>
                                        <Textarea
                                            name="text"
                                            placeholder="Escreva o conteúdo do post"
                                            rows={6}
                                        />
                                    </Field.Root>
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" onClick={toggleModal}>Cancelar</Button>
                                </Dialog.ActionTrigger>
                                <Button type="submit" loading={pending}>Publicar</Button>
                            </Dialog.Footer>
                        </form>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default ModalCreatePost;
