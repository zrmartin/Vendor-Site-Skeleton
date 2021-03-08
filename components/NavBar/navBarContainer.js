import { Flex } from "@chakra-ui/react"
export const NavBarContainer = ({ children, ...props }) => {
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      w="100%"
      mb={4}
      p={8}
      bg={["blue.100", "blue.100", "transparent", "transparent"]}
      color={["black", "black", "black", "black"]}
      {...props}
    >
      {children}
    </Flex>
  )
}