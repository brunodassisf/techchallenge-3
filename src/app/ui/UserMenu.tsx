"use client"

import { Box, Button, Flex, Link, Text } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/client-auth"
import { useSession } from "./SessionContext"
import Sidebar from "./Sidebar"

const UserMenu: React.FC = () => {
    const router = useRouter()
    const { name, role } = useSession()

    return (
        <Box>
            <Box display="none" lg={{ display: 'block' }}>
                <Flex gap={3} mb={3} align="center">
                    <Text fontWeight={700}>Bem-vindo, {name}</Text>
                    <Link textDecoration="underline" cursor="pointer" href="/">Home</Link>
                    <Link textDecoration="underline" cursor="pointer" href={role === "ADMIN" ? "/admin" : "/area-professor"}>Dashboard</Link>
                    <Text textDecoration="underline" cursor="pointer" onClick={() => logout(router)}>Sair</Text>
                </Flex>
            </Box>
            <Sidebar />
        </Box>
    )
}

export default UserMenu;
