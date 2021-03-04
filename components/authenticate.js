import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from '../context/accountContext';
import Unauthenticated from '../pages/unauthenticated';
import { ROLES } from '../util/constants/roles';
import { GET, CALL_FAUNA_FUNCTION } from '../util/requests';
import { getId } from '../util/helpers';
import { Loading } from '../components';
const { VERCEL_FUNCTIONS: { Refresh_Fauna_Token }} = require('../util/constants/vercelFunctions')
const { FUNCTIONS: { Get_Shop, Get_Shopping_Cart_For_Account }} = require('../util/constants/database/functions')

export const Authenticate = ({ Component, pageProps }) => {
  const { pathname, query } = useRouter();
  const { account, setAccount, accessToken, setAccessToken, busy, setBusy, shopOwnerAccountId, setShopOwnerAccountId, shoppingCartId, setShoppingCartId} = useAccount();
  const role = pathname.split("/")[1].toLowerCase();
  const { shopId } = query
  const accountRoles = account?.data?.roles

  // Page was reloaded OR accessToken expired
  useEffect(async () => {
    if (localStorage.getItem("loggedIn") && (!account || !accessToken)) {
      await refreshAccountAndToken()
    }
    if (accessToken && !shoppingCartId) {
      await getShoppingCartId()
    }
    if (accessToken && shopId && !shopOwnerAccountId) {
      await verifyShopOwnership()
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
      setShopOwnerAccountId(null)
      setShoppingCartId(null)
    }
  }

  const verifyShopOwnership = async () => {
    setBusy(true)
    try {
      const getShopResponse = await CALL_FAUNA_FUNCTION(Get_Shop, accessToken, null, {
        id: shopId
      })
      setShopOwnerAccountId(getId(getShopResponse?.shop.data?.account))
    }
    catch(e) {
    }
  }

  const getShoppingCartId = async () => {
    setBusy(true)
    try {
      const getShoppingCartReponse = await CALL_FAUNA_FUNCTION(Get_Shopping_Cart_For_Account, accessToken, null, {})
      setShoppingCartId(getId(getShoppingCartReponse.shoppingCart))
    }
    catch(e) {
    }
  }

  if (busy) {
    return <Loading/>
  }

  //User is not logged in and trying to access restricted paths
  if (!account && role in ROLES) {
    return <Unauthenticated message={"Please login to view this page"} showLogin={true}/>
  }

  //User is logged in but they do not have the proper roles to view this page.
  if((!accountRoles?.includes(role) && role in ROLES) || (shopOwnerAccountId && shopOwnerAccountId !== getId(account))) {
    return <Unauthenticated message={"You do not have permission to access to this page"} showLogin={false}/>
  }

  return <Component {...pageProps}/>;
};