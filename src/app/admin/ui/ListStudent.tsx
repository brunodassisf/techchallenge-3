import { Box, Table, Text } from "@chakra-ui/react"
import { Student } from "../../../../generated/prisma/client";

const ListStudent: React.FC<{ data: Student[] }> = ({ data }) => {
    return (
        <Box p={5}>
            <Text fontSize="xl" fontWeight={700}>Lista de Estudantes</Text>
            <Table.Root size="sm">
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader>Estudante</Table.ColumnHeader>
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
            {data.length === 0 && <Text mt={3} color="fg.muted">Nenhum estudante cadastrado.</Text>}
        </Box>
    )
}

export default ListStudent;
