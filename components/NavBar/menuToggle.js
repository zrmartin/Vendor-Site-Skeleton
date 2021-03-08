import { Box } from "@chakra-ui/react"
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
export const MenuToggle = ({ toggle, isOpen }) => {
  return (
    <Box display={{ base: "block", md: "none" }} onClick={toggle}>
      {isOpen ? <CloseIcon /> : <HamburgerIcon />}
    </Box>
  )
}