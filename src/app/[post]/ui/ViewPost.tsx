import { Box, Flex, Separator, Stack, Text } from "@chakra-ui/react";
import { PostWithAuthor } from "@/actions/post";
import { FaArrowCircleLeft, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

const ViewPost: React.FC<{ data: PostWithAuthor }> = ({ data }) => {
    return (
        <Box>
            <Box px={10}>
                <Flex align="flex-start"  gap={3}>
                    <Link href="/">
                        <Box>
                            <FaArrowLeft size={20} />
                        </Box>
                    </Link>
                    <Stack w="full">
                        <Text fontSize="xl" fontWeight={600} lineHeight={1} mb={3}>{data.title}</Text>
                        <Text fontSize="sm" lineHeight={1} textAlign={{base: 'left', md: 'right' }}>Professor: {data.authors.name}</Text>
                    </Stack>
                </Flex>
                <Separator my={4} />
                <Text fontSize="sm">{data.text}</Text>
            </Box>
        </Box>
    )
}

export default ViewPost;