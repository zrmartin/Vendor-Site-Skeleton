import { useRouter } from 'next/router';
import { useUser } from '../context/userContext';
import Unauthenticated from '../pages/unauthenticated';
import { ROLES } from '../util/constants/roles';

export const Authenticate = ({ Component, pageProps }) => {
  const { pathname } = useRouter();
  const { user } = useUser();
  const userRoles = user?.app_metadata?.roles

  const role = pathname.split("/")[1].toLowerCase();

  // User is not logged in and trying to access restricted paths
  if (!user && role in ROLES) {
    return <Unauthenticated message={"Please login to view this page"}/>
  }

  // User is logged in but they do not have the proper roles to view this page.
  if(!userRoles?.includes(role) && role in ROLES) {
    return <Unauthenticated message={"You do not have permission to access to this page"}/>
  }

  return <Component {...pageProps}/>;
};