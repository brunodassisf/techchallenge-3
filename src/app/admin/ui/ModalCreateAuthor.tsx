"use client"

import { FormState } from "@/lib/definition"
import { toaster } from "@/components/ui/toaster"
import usePasswordVisibility from "@/hook/usePasswordVisibility"
import { Button, Dialog, Field, Input, InputGroup, Portal, Stack } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState } from "react"

const ModalCreateAuthor: React.FC = () => {
    const inputPassword = usePasswordVisibility()
    const router = useRouter()
    const [open, setOpen] = useState(false)

    async function createAuthor(_prevState: FormState, formData: FormData): Promise<FormState> {
        const res = await fetch("/api/author", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: formData.get("name"),
                email: formData.get("email"),
                password: formData.get("password"),
            }),
        })
        const body = await res.json()

        if (!res.ok) {
            if (body.errors) return { errors: body.errors }
            return { ok: false, message: body.error ?? "Erro ao cadastrar professor(a)." }
        }

        setOpen(false)
        router.refresh()
        return { ok: true, message: body.message }
    }

    const [state, action, pending] = useActionState(createAuthor, undefined);
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
                <Button>Cadastrar Professor</Button>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <form action={action}>
                            <Dialog.Header>
                                <Dialog.Title>Cadastrar professor(a)</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body pb="4">
                                <Stack gap="4">
                                    <Field.Root>
                                        <Field.Label>Nome</Field.Label>
                                        <Input
                                            name="name"
                                            placeholder="Nome do professor(a)"
                                        />
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label>E-mail</Field.Label>
                                        <Input
                                            name="email"
                                            type="email"
                                            placeholder="email@exemplo.com"
                                        />
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label>Senha</Field.Label>
                                        <InputGroup endElement={inputPassword.endElement}>
                                            <Input
                                                name="password"
                                                type={inputPassword.type}
                                                placeholder="Senha de acesso"
                                            />
                                        </InputGroup>
                                    </Field.Root>
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" onClick={toggleModal}>Cancelar</Button>
                                </Dialog.ActionTrigger>
                                <Button type="submit" loading={pending}>Salvar</Button>
                            </Dialog.Footer>
                        </form>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default ModalCreateAuthor;
