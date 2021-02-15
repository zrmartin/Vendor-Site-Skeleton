import { useAccount } from '../context/accountContext';

export const ServerError = ({ error }) => {
  const { setAccount, setAccessToken, setBusy } = useAccount();
  // Access Token has expired. set them to null. so Authenticate component can get a new token. If that fails it will prompt user to login
  if (error.status === 401) {
    setBusy(true)
    setAccount(null)
    setAccessToken(null)
  }
  return (
    <>
      Could not reach server, please try again. If this issue persists please contact Admin.
      <br/>
      Status Code: {error.status}
      <br/>
      Error Message: {error.message}
    </>
  )
};