import { RiNextjsLine } from "react-icons/ri";
import { Box, Flex, Separator, Text } from "@chakra-ui/react"
import { ColorModeButton } from "@/components/ui/color-mode";

const TitlePage: React.FC = () => {
    return (
        <Box p={5}>
            <Flex justify="end" mb={2}>
                <ColorModeButton />
            </Flex>
            <Flex align="center" gap={3} mb={5}>
                <RiNextjsLine size={38} />
                <Text fontSize="3xl" fontWeight={700}>Tech Challenge 3</Text>
            </Flex>
            <Separator />
        </Box>
    )
}

export default TitlePage;