'use client'

import { Box, Field, Flex, Input, Portal, Select, Stack, Text, createListCollection } from "@chakra-ui/react";
import { RiFileList3Line } from "react-icons/ri";
import { PostWithAuthor } from "@/actions/post";
import { Author } from "../../../generated/prisma/client";
import Link from "next/link";
import { useMemo, useState } from "react";

interface ListPostProps {
    data: PostWithAuthor[];
    authors: Author[];
}

const ListPost: React.FC<ListPostProps> = ({ data, authors }) => {
    const [selectedAuthor, setSelectedAuthor] = useState<string[]>([]);
    const [searchKeyWord, setSearchKeyWord] = useState("");

    const authorCollection = useMemo(
        () =>
            createListCollection({
                items: authors.map((author) => ({ label: author.name, value: author.id })),
            }),
        [authors]
    );

    const filteredPosts = useMemo(() => {
        const [authorId] = selectedAuthor;
        if (!authorId && searchKeyWord === '') return data;
        const searchWordLower = searchKeyWord.toLowerCase();
        return data.filter((post) => post.authorId === authorId || post.text.toLowerCase().includes(searchWordLower) || post.title.toLowerCase().includes(searchWordLower));
    }, [data, selectedAuthor, searchKeyWord]);

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
                {filteredPosts.length === 0 && (
                    <Text color="fg.muted">Nenhum post encontrado para este professor.</Text>
                )}
                {filteredPosts.map((item) => (
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
