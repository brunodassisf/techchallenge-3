"use client"

import { Box, Button, Flex, Text } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { logout } from "@/actions/auth"
import { Role } from "../../../generated/prisma/client"
import Sidebar from "./Sidebar"

interface UserMenuProps {
    name: string
    role: Role
}

const UserMenu: React.FC<UserMenuProps> = ({ name, role }) => {
    const router = useRouter()

    function goToDashboard() {
        router.push(role === "ADMIN" ? "/admin" : "/area-professor")
    }

    return (
        <Box>
            <Box display="none" lg={{ display: 'block' }}>
                <Flex gap={3} mb={3} align="center">
                    <Button onClick={goToDashboard}>Dashboard</Button>
                    <Text fontWeight={700}>Bem-vindo, {name}</Text>
                    <Text textDecoration="underline" cursor="pointer" onClick={logout}>Sair</Text>
                </Flex>
            </Box>
            <Sidebar name={name} role={role} />
        </Box>
    )
}

export default UserMenu;
