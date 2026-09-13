'use client'

import { Box, Flex, Table, Text } from "@chakra-ui/react"
import ModalCreateAuthor from "./ModalCreateAuthor";
import { Author } from "../../../../generated/prisma/client";

const ListAuthor: React.FC<{ data: Author[] }> = ({ data }) => {
    return (
        <Box p={5}>
            <Flex justify="space-between" align="center">
                <Text fontSize="xl" fontWeight={700}>Lista de Professores</Text>
                <ModalCreateAuthor />
            </Flex>
            <Table.Root size="sm">
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader>Professor</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map((item) => (
                        <Table.Row key={item.id}>
                            <Table.Cell>{item.name}</Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>

        </Box>
    )
}

export default ListAuthor;