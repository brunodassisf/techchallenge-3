import { RiNextjsLine } from "react-icons/ri";
import { Box, Flex, Separator, Text } from "@chakra-ui/react"
import { ColorModeButton } from "@/components/ui/color-mode";
import ModalLogin from "./ModalLogin";
import ModalCadastro from "./ModalCadastro";
import UserMenu from "./UserMenu";
import { getSession } from "@/lib/dal";

const TitlePage: React.FC = async () => {
    const session = await getSession();

    return (
        <Box pt={3}>
            <Flex justify="end">
                <ColorModeButton />
            </Flex>
            <Flex justify="space-between" align="center" mb={2} gap={3}>
                <Flex align="center" gap={1}>
                    <RiNextjsLine size={38} />
                    <Text fontSize={{base: 'lg', lg: '2xl'}} fontWeight={700}>Tech Challenge 3</Text>
                </Flex>
                {session ? (
                    <UserMenu name={session.name} role={session.role} />
                ) : (
                    <Flex gap={3}>
                        <ModalLogin />
                        <ModalCadastro />
                    </Flex>
                )}
            </Flex>
            <Separator />
        </Box>
    )
}

export default TitlePage;
