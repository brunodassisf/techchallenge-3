"use client"

import { FaBars } from "react-icons/fa";
import { CloseButton, Drawer, Portal, Separator } from "@chakra-ui/react"
import { Box, Button, Flex, Text } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/client-auth"
import { useSession } from "./SessionContext"
import { useState } from "react";

const Sidebar: React.FC = () => {
    const router = useRouter()
    const { name, role } = useSession()

    const [open, setOpen] = useState(false)

    function goToDashboard() {
        router.push(role === "ADMIN" ? "/admin" : "/area-professor")
    }

    return (
        <Box>

            <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
                <Drawer.Trigger asChild>
                    <Button lg={{ display: 'none' }} variant="outline" size="sm">
                        <FaBars />
                    </Button>
                </Drawer.Trigger>
                <Portal>
                    <Drawer.Backdrop />
                    <Drawer.Positioner>
                        <Drawer.Content>
                            <Drawer.Header>
                                <Drawer.Title>Tech Challenge 3</Drawer.Title>
                            </Drawer.Header>
                            <Drawer.Body>
                                <Flex gap={3} mb={3}>
                                    <Text fontWeight={700} fontSize="md">Bem-vindo, {name}</Text>
                                </Flex>
                                <Separator />
                                <Box mt={3}>
                                    <Text onClick={goToDashboard}>Dashboard</Text>
                                </Box>
                            </Drawer.Body>
                            <Drawer.Footer>
                                <Button onClick={() => logout(router)}>Sair</Button>
                            </Drawer.Footer>
                            <Drawer.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Drawer.CloseTrigger>
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Portal>
            </Drawer.Root>
        </Box>
    )
}

export default Sidebar;
