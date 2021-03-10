import { Box } from "@chakra-ui/react"
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from '../context/accountContext';
import Unauthenticated from '../pages/unauthenticated';
import { ROLES } from '../util/constants/roles';
import { GET, CALL_FAUNA_FUNCTION } from '../util/requests';
import { getId } from '../util/helpers';
import { Loading, Navbar } from '../components';
const { VERCEL_FUNCTIONS: { Refresh_Fauna_Token }} = require('../util/constants/vercelFunctions')
const { FUNCTIONS: { Get_Shop_For_Account, Get_Shopping_Cart_For_Account }} = require('../util/constants/database/functions')

export const Authenticate = ({ Component, pageProps }) => {
  const { pathname } = useRouter();
  const { account, setAccount, accessToken, setAccessToken, busy, setBusy, shopId, setShopId, shoppingCartId, setShoppingCartId, shoppingCartQuantity, setShoppingCartQuantity} = useAccount();
  const role = pathname.split("/")[1].toLowerCase();
  const accountRoles = account?.data?.roles

  // Page was reloaded OR accessToken expired
  useEffect(async () => {
    if (localStorage.getItem("loggedIn") && (!account || !accessToken)) {
      await refreshAccountAndToken()
    }
    if (accessToken && (!shoppingCartId || shoppingCartQuantity === null)) {
      await getShoppingCart()
    }
    if (accessToken && !shopId) {
      console.log()
      await getShopId()
    }
    setBusy(false)
  }, [accessToken, Component])

  const refreshAccountAndToken = async () => {
    setBusy(true)
    try {
      const results = await GET(Refresh_Fauna_Token)
      setAccount(results.account)
      setAccessToken(results.secret)
    }
    catch(e) {
      localStorage.removeItem("loggedIn")
      setAccessToken(null)
      setAccount(null)
      setShopId(null)
      setShoppingCartId(null)
      setShoppingCartQuantity(null)
    }
  }

  const getShopId = async () => {
    setBusy(true)
    try {
      const getShopForAccountResponse = await CALL_FAUNA_FUNCTION(Get_Shop_For_Account, accessToken, null, {})
      setShopId(getId(getShopForAccountResponse?.shop))
    }
    catch(e) {
    }
  }

  const getShoppingCart = async () => {
    setBusy(true)
    try {
      const getShoppingCartReponse = await CALL_FAUNA_FUNCTION(Get_Shopping_Cart_For_Account, accessToken, null, {})
      setShoppingCartId(getId(getShoppingCartReponse.shoppingCart))
      setShoppingCartQuantity(getShoppingCartReponse.numProducts)
    }
    catch(e) {
    }
  }

  if (busy) {
    return (
      <>
        <Navbar numProducts={shoppingCartQuantity}/>
        <Box maxWidth={"80em"} mx={{ base: "30", xl: "auto" }}>
          <Loading/>
        </Box>
      </>

    )
  }

  // User is not logged in and trying to access restricted paths
  if (!account && role in ROLES) {
    return (
      <>
        <Navbar numProducts={shoppingCartQuantity}/>
        <Box maxWidth={"80em"} mx={{ base: "30", xl: "auto" }}>
          <Unauthenticated message={"Please login to view this page"} showLogin={true}/>
        </Box>
      </>
    )
  }

  // User is logged in but they do not have the proper roles to view this page.
  if((!accountRoles?.includes(role) && role in ROLES)) {
    return (
      <>
        <Navbar numProducts={shoppingCartQuantity}/>
        <Box maxWidth={"80em"} mx={{ base: "30", xl: "auto" }}>
          <Unauthenticated message={"You do not have permission to access to this page"} showLogin={false}/>
        </Box>
      </>
    )
  }

  return (
    <>
      <Navbar numProducts={shoppingCartQuantity}/>
      <Box maxWidth={"80em"} mx={{ base: "30", xl: "auto" }}>
        <Component {...pageProps}/>
      </Box>
    </>

  );
};