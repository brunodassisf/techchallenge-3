"use client"

import { Button, Dialog, Field, Input, Portal, Stack, Text } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useRef, useState, useTransition } from "react"

const ModalCreateAuthor: React.FC = () => {
    const router = useRouter()
    const nameRef = useRef<HTMLInputElement | null>(null)
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    function resetAndClose() {
        setName("")
        setEmail("")
        setError(null)
        setOpen(false)
    }

    function handleSave() {
        setError(null)
        startTransition(async () => {
            // const result = await createAuthor({ name, email })
  
            resetAndClose()
            router.refresh()
        })
    }

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(details) => setOpen(details.open)}
            initialFocusEl={() => nameRef.current}
        >
            <Dialog.Trigger asChild>
                <Button>Cadastrar Professor</Button>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Cadastrar professor(a)</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body pb="4">
                            <Stack gap="4">
                                <Field.Root>
                                    <Field.Label>Nome</Field.Label>
                                    <Input
                                        ref={nameRef}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Nome do professor(a)"
                                    />
                                </Field.Root>
                                <Field.Root>
                                    <Field.Label>E-mail</Field.Label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@exemplo.com"
                                    />
                                </Field.Root>
                                {error && (
                                    <Text fontSize="sm" color="fg.error">{error}</Text>
                                )}
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" onClick={resetAndClose}>Cancelar</Button>
                            </Dialog.ActionTrigger>
                            <Button onClick={handleSave} loading={isPending}>Salvar</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default ModalCreateAuthor;
