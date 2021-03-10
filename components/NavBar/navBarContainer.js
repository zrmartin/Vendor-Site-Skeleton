import { Flex } from "@chakra-ui/react"
export const NavBarContainer = ({ children }) => {
  return (
    <Flex
      as="nav"
      align="flex-start"
      justify="space-between"
      wrap="wrap"
      maxWidth={"80em"}
      mx={{ base: "30", xl: "auto" }}
      mb={4}
      py={4}
      color={["black"]}
    >
      {children}
    </Flex>
  )
}