import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from '../context/accountContext';
import Unauthenticated from '../pages/unauthenticated';
import { ROLES } from '../util/constants/roles';
import { getAccessTokenAndAccount } from '../util/requests';

export const Authenticate = ({ Component, pageProps }) => {
  const { pathname } = useRouter();
  const { account, accessToken, setAccount, setAccessToken, busy, setBusy, setSessionExpired, sessionExpired } = useAccount();
  const role = pathname.split("/")[1].toLowerCase();
  const accountRoles = account?.data?.roles

  // Page was reloaded OR accessToken expired
  useEffect(() => {
    if ((!account || !accessToken) && role in ROLES) {
      refreshAccountAndToken()
    }
  }, [account, accessToken])

  const refreshAccountAndToken = async () => {
    try {
      const results = await getAccessTokenAndAccount()
      setAccount(results.account)
      setAccessToken(results.secret)
      setBusy(false)
      setSessionExpired(false)
    }
    catch(e) {
      setBusy(false)
      setSessionExpired(true)
    }
  }

  if (busy) {
    return (
      <h1>Attempting to refresh your session</h1>
    )
  }

  if (sessionExpired) {
    return <Unauthenticated message={"Your session has expired, please login again"}/>
  }

  //User is not logged in and trying to access restricted paths
  if (!account && role in ROLES) {
    return <Unauthenticated message={"Please login to view this page"}/>
  }

  //User is logged in but they do not have the proper roles to view this page.
  if(!accountRoles?.includes(role) && role in ROLES) {
    return <Unauthenticated message={"You do not have permission to access to this page"}/>
  }

  return <Component {...pageProps}/>;
};