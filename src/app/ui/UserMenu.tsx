"use client"

import { Box, Button, Flex, Link, Text } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/client-auth"
import { Role } from "../../../generated/prisma/client"
import Sidebar from "./Sidebar"

interface UserMenuProps {
    name: string
    role: Role
}

const UserMenu: React.FC<UserMenuProps> = ({ name, role }) => {
    const router = useRouter()

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
            <Sidebar name={name} role={role} />
        </Box>
    )
}

export default UserMenu;
