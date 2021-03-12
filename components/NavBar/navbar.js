import NextLink from "next/link"
import toast from 'react-hot-toast'
import { ShoppingCart } from 'react-feather';
import { Box, Center, useDisclosure, Link } from "@chakra-ui/react";
import { useState } from 'react'
import { useRouter } from 'next/router'
import { NavBarContainer } from './navBarContainer'
import { MenuToggle } from './menuToggle'
import { MenuLinks } from './menuLinks'
import { GET } from "../../util/requests"
import { useAccount } from '../../context/accountContext'
import { LoginRegisterModal } from '../../components'
import { handleFaunaResults, handleFaunaError } from '../../util/helpers'
const { VERCEL_FUNCTIONS: { LogOut }} = require ('../../util/constants/vercelFunctions')
const { URL_PATHS: { Shopping_Cart_Index_Page, Home_Page }} = require('../../util/constants/urlPaths')

export const Navbar = ({numProducts}) => {
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  let accountContext = useAccount()
  const [navbarIsOpen, setNavbarIsOpen] = useState(false)
  console.log(isOpen)
  const toggle = () => setNavbarIsOpen(!navbarIsOpen)
 
  let logout = async () => {
    const toastId = toast.loading("Loading")
    try {
      let logOutResults = await GET(LogOut)
      handleFaunaResults({
        results: logOutResults,
        toastId,
      })
      accountContext.setAccessToken(undefined)
      accountContext.setAccount(undefined)
      accountContext.setShopId(undefined)
      accountContext.setShoppingCartId(undefined)
      accountContext.setShoppingCartQuantity(undefined)
      localStorage.removeItem("loggedIn")
      router.push(Home_Page)
    }
    catch (e){
      handleFaunaError(accountContext, e, toastId)
    }
  }

  return (
    <>
    <Box 
      maxWidth={"80em"}
      mx={{ base: "30", xl: "auto" }}
    >
      <Center>
        <NextLink href={Home_Page} passHref>
          <Box _hover={{ cursor:"pointer" }}>
            Logo
          </Box>
        </NextLink>
      </Center>
    </Box>

    <Box bg={["blue.100"]}>
      <NavBarContainer>
        <MenuToggle toggle={toggle} isOpen={navbarIsOpen} />
          <NextLink href={Shopping_Cart_Index_Page} passHref>
            <Box display="flex" _hover={{ cursor:"pointer" }}>
              <ShoppingCart/>
              {numProducts ? 
                <Box as="span" position={"relative"} top={"-8px"} right={'-3px'}>
                  {numProducts}
                </Box>
                : <></>
              }
            </Box>
          </NextLink>
          {accountContext.account !== undefined ? (
            <Link onClick={() => logout()}> 
              Logout
            </Link>
          ) : (
            <>
              <Link onClick={() => onOpen()}> 
                Login
              </Link>
              <LoginRegisterModal onClose={onClose} isOpen={isOpen}/>
            </>
          )}


        {/* Force Menu items to be on seperate line */}
        <Box flexBasis={"100%"} h={0}/>
        <MenuLinks isOpen={navbarIsOpen} />
      </NavBarContainer>
    </Box>
    </>
  )
}