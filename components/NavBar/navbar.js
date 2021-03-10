import { useState } from 'react'
import { NavBarContainer } from './navBarContainer'
import { MenuToggle } from './menuToggle'
import { MenuLinks } from './menuLinks'
import NextLink from "next/link"
import { ShoppingCart } from 'react-feather';
import { Box } from "@chakra-ui/react";
const { URL_PATHS: { Shopping_Cart_Index_Page, Home_Page }} = require('../../util/constants/urlPaths')

export const Navbar = (props) => {
  const [isOpen, setIsOpen] = useState(false)
 
  const toggle = () => setIsOpen(!isOpen)
 
  return (
    <Box bg={["blue.100"]}>
      <NavBarContainer {...props}>
        <MenuToggle toggle={toggle} isOpen={isOpen} />
        <NextLink href={Home_Page} passHref>
          <Box>
            Logo
          </Box>
        </NextLink>
        <NextLink href={Shopping_Cart_Index_Page} passHref>
              <Box _hover={{ cursor:"pointer" }}>
                <ShoppingCart/>
                <Box as="span" position={"relative"} top={"-35px"} right={'-27px'}>
                  5
                </Box>
              </Box>
        </NextLink>

        {/* Force Menu items to be on seperate line */}
        <Box flexBasis={"100%"} h={0}/>
        <MenuLinks isOpen={isOpen} />
      </NavBarContainer>
    </Box>

  )
}