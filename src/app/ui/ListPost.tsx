'use client'

import { Box, createListCollection, Field, Flex, Input, Portal, Select, Stack, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { RiFileList3Line } from "react-icons/ri";
import { Author, Post } from "../../../generated/prisma/client";
import { useMemo, useState } from "react";
import { getPosts } from "@/services/post";
import { getAuthors } from "@/services/author";


const ListPost: React.FC = () => {
    const [selectedAuthor, setSelectedAuthor] = useState<string[]>([]);
    const [searchKeyWord, setSearchKeyWord] = useState<string>('');

    const [authorId] = selectedAuthor;

    const { data } = useQuery<Post[]>({
        queryKey: ['posts', authorId ?? '', searchKeyWord],
        queryFn: () => getPosts(authorId ?? '', searchKeyWord),
    })
    const { data: authors } = useQuery<Author[]>({ queryKey: ['getAuthors'], queryFn: () => getAuthors() })

    const authorCollection = useMemo(
        () =>
            createListCollection({
                items: (authors ?? []).map((author) => ({ label: author.name, value: author.id })),
            }),
        [authors]
    );

    return (
        <Stack>
            <Box p={5}>
                <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                    <Flex align="center" gap={3}>
                        <RiFileList3Line size={24} />
                        <Text fontWeight={600} textStyle="xl">Lista de postagens</Text>
                    </Flex>
                    <Flex wrap="wrap" gap={4}>
                        <form>
                            <Field.Root width="240px">
                                <Field.Label>Buscar por</Field.Label>
                                <Input value={searchKeyWord} onChange={(e) => setSearchKeyWord(e.target.value)} />
                            </Field.Root>
                        </form>
                        <Select.Root
                            collection={authorCollection}
                            value={selectedAuthor}
                            onValueChange={(details) => setSelectedAuthor(details.value)}
                            width="240px"
                        >
                            <Select.HiddenSelect />
                            <Select.Label>Filtrar por professor</Select.Label>
                            <Select.Control>
                                <Select.Trigger>
                                    <Select.ValueText placeholder="Todos os professores" />
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                    <Select.ClearTrigger />
                                    <Select.Indicator />
                                </Select.IndicatorGroup>
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content>
                                        {authorCollection.items.map((author) => (
                                            <Select.Item item={author} key={author.value}>
                                                <Select.ItemText>{author.label}</Select.ItemText>
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>
                    </Flex>
                </Flex>
            </Box>
            <Stack mx="24px" gap={3}>
                {data?.length === 0 && (
                    <Text color="fg.muted">Nenhum post encontrado.</Text>
                )}
                {data?.map((item) => (
                    <Link href={`/${item.id}`} key={item.id}>
                        <Box border="sm" p={4} px={10}>
                            <Text fontSize="lg" fontWeight={600} mb={3}>{item.title}</Text>
                            <Text fontSize="sm" lineClamp="2">{item.text}</Text>
                        </Box>
                    </Link>
                ))}
            </Stack>
        </Stack>
    )
}

export default ListPost;
