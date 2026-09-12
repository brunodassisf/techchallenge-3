"use client"

import { login } from "@/actions/auth"
import { toaster } from "@/components/ui/toaster"
import usePasswordVisibility from "@/hook/usePasswordVisibility"
import { Button, Dialog, Field, Input, InputGroup, Portal, Stack } from "@chakra-ui/react"
import { useActionState, useEffect, useState } from "react"


const ModalLogin: React.FC = () => {
    const inputPassword = usePasswordVisibility()
    const [open, setOpen] = useState(false)
    const [state, action, pending] = useActionState(login, undefined);
    const toggleModal = () => setOpen(!open)

    useEffect(() => {
        if (!state?.errors) return
        const timeout = setTimeout(() => {
            const description = Object.values(state.errors!).flat().join("\n")
            toaster.create({
                type: "error",
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
                <Button variant="outline">Entrar</Button>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <form action={action}>
                            <Dialog.Header>
                                <Dialog.Title>Login</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body pb="4">
                                <Stack gap="4">
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
                                                id="password"
                                                name="password"
                                                type={inputPassword.type}
                                                placeholder="Digite sua nova senha"
                                            />
                                        </InputGroup>
                                    </Field.Root>
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" onClick={toggleModal}>Fechar</Button>
                                </Dialog.ActionTrigger>
                                <Button type="submit" loading={pending}>Entrar</Button>
                            </Dialog.Footer>
                        </form>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default ModalLogin;
