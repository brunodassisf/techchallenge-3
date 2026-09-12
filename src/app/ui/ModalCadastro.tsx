"use client"

import { Button, Dialog, Field, Input, Portal, Stack, Text } from "@chakra-ui/react"
import { useState, useTransition } from "react"

const ModalCadastro: React.FC = () => {

    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const toggleModal = () => setOpen(!open)

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(details) => setOpen(details.open)}
        >
            <Dialog.Trigger asChild>
                <Button>Cadastro</Button>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <form>
                            <Dialog.Header>
                                <Dialog.Title>Cadastrar professor(a)</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body pb="4">
                                <Stack gap="4">
                                    <Field.Root>
                                        <Field.Label>E-mail</Field.Label>
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="email@exemplo.com"
                                        />
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label>Senha</Field.Label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Nome do professor(a)"
                                        />
                                    </Field.Root>
                                    {error && (
                                        <Text fontSize="sm" color="fg.error">{error}</Text>
                                    )}
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" onClick={toggleModal}>Fechar</Button>
                                </Dialog.ActionTrigger>
                                <Button type="submit" loading={isPending}>Entrar</Button>
                            </Dialog.Footer>
                        </form>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default ModalCadastro;
