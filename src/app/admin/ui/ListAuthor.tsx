'use client'

import { Box, Flex, Text } from "@chakra-ui/react"
import ModalCreateAuthor from "./ModalCreateAuthor";

const ListAuthor: React.FC = () => {
    return (
        <Box p={5}>
            <Flex justify="space-between" align="center">
                <Text fontSize="xl" fontWeight={700}>Lista de Professores</Text>
                <ModalCreateAuthor />
            </Flex>
        </Box>
    )
}

export default ListAuthor;