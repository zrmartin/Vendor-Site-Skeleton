import { useEffect } from 'react'
import { useAccount } from '../context/accountContext';
import { handleFaunaError } from '../util/helpers'

export const ServerError = ({ error }) => {
  const accountContext = useAccount();

  useEffect(() => {
    handleFaunaError(accountContext, error)
  }, [])

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