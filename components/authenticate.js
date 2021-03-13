import { Box } from "@chakra-ui/react"
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from '../context/accountContext';
import { ROLES } from '../util/constants/roles';
import { GET, CALL_FAUNA_FUNCTION } from '../util/requests';
import { getId } from '../util/helpers';
import { Loading, Navbar, Unauthenticated } from '../components';
const { VERCEL_FUNCTIONS: { Refresh_Fauna_Token }} = require('../util/constants/vercelFunctions')
const { FUNCTIONS: { Get_Shop_For_Account, Get_Shopping_Cart_For_Account }} = require('../util/constants/database/functions')
const { ROLES: { owner }} = require('../util/constants/roles')
const { REDUCERS: {Set_Busy, Set_All, Logout }} = require('../util/constants/reducers')

export const Authenticate = ({ Component, pageProps }) => {
  const { pathname } = useRouter();
  const { dispatch, accountContext } = useAccount();
  const role = pathname.split("/")[1].toLowerCase();
  const accountRoles = accountContext.account?.data?.roles

  // Page was reloaded OR accessToken expired
  useEffect(async () => {
    let dispatchResults = {}
    if (localStorage.getItem("loggedIn") && !accountContext.accessToken) {
      dispatch({type: Set_Busy})

      // Get Account and Access Token
      const refreshResults = await refreshAccountAndToken()
      if (refreshResults) {
        dispatchResults = {
          ...dispatchResults,
          account: refreshResults.account,
          accessToken: refreshResults.secret
        }
      }
      else {
        dispatch({type: Logout})
      }
      
      // Get ShoppingCartId and Quantity
      if (accountContext.shoppingCartId && accountContext.shoppingCartQuantity) {
        dispatchResults = {
          ...dispatchResults,
          shoppingCartId: accountContext.shoppingCartId,
          shoppingCartQuantity: accountContext.shoppingCartQuantity
        }
      }
      else {
        const shoppingCartResults = await getShoppingCart(dispatchResults.accessToken)
        dispatchResults = {
          ...dispatchResults,
          shoppingCartId: getId(shoppingCartResults.shoppingCart),
          shoppingCartQuantity: shoppingCartResults.numProducts
        }
      }

      // Get ShopId if user is an owner
      if (dispatchResults.account.data.roles.includes(owner) && !accountContext.shopId) {
        const shopId = await getShopId(dispatchResults.accessToken)
        dispatchResults = {
          ...dispatchResults,
          shopId
        }
      }
      else {
        dispatchResults = {
          ...dispatchResults,
          shopId: undefined
        }
      }
      dispatch({type: Set_All, results: dispatchResults})
    }
  }, [accountContext.accessToken])

  const refreshAccountAndToken = async () => {
    try {
      const results = await GET(Refresh_Fauna_Token)
      return results
    }
    catch(e) {
      return null
    }
  }

  const getShopId = async (accessToken) => {
    try {
      const getShopForAccountResponse = await CALL_FAUNA_FUNCTION(Get_Shop_For_Account, accessToken, null, {})
      return getId(getShopForAccountResponse.shop)
    }
    catch(e) {
    }
  }

  const getShoppingCart = async (accessToken) => {
    try {
      const getShoppingCartReponse = await CALL_FAUNA_FUNCTION(Get_Shopping_Cart_For_Account, accessToken, null, {})
      return getShoppingCartReponse
    }
    catch(e) {
      return null
    }
  }

  if (accountContext.busy) {
    return (
      <>
        <Navbar numProducts={accountContext.shoppingCartQuantity}/>
        <Box maxWidth={"80em"} mx={{ base: "30", xl: "auto" }}>
          <Loading/>
        </Box>
      </>

    )
  }

  // User is not logged in and trying to access restricted paths
  if (!accountContext.account && role in ROLES) {
    return (
      <>
        <Navbar numProducts={accountContext.shoppingCartQuantity}/>
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
        <Navbar numProducts={accountContext.shoppingCartQuantity}/>
        <Box maxWidth={"80em"} mx={{ base: "30", xl: "auto" }}>
          <Unauthenticated message={"You do not have permission to access to this page"} showLogin={false}/>
        </Box>
      </>
    )
  }

  return (
    <>
      <Navbar numProducts={accountContext.shoppingCartQuantity}/>
      <Box maxWidth={"80em"} mx={{ base: "30", xl: "auto" }}>
        <Component {...pageProps}/>
      </Box>
    </>

  );
};