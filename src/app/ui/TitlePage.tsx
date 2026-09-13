import { ColorModeButton } from "@/components/ui/color-mode";
import { getSession } from "@/lib/dal";
import { Box, Flex, Separator, Text } from "@chakra-ui/react";
import { RiNextjsLine } from "react-icons/ri";
import ModalLogin from "./ModalLogin";
import UserMenu from "./UserMenu";
import { SessionProvider } from "./SessionContext";

const TitlePage: React.FC = async () => {
    const session = await getSession();

    return (
        <Box pt={3}>
            <Flex justify="end">
                <ColorModeButton />
            </Flex>
            <Flex justify="space-between" align="center" mb={2} mt={2} gap={3}>
                <Flex align="center" gap={1}>
                    <RiNextjsLine size={38} />
                    <Text fontSize={{ base: 'lg', lg: '2xl' }} fontWeight={700}>Tech Challenge 3</Text>
                </Flex>
                {session ? (
                    <SessionProvider value={{ name: session.name, role: session.role }}>
                        <UserMenu />
                    </SessionProvider>
                ) : (
                    <ModalLogin />
                )}
            </Flex>
            <Separator />
        </Box>
    )
}

export default TitlePage;
