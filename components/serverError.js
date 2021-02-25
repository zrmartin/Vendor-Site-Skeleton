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
      An Error Occured
      <br/>
      Status Code: {error.status}
      <br/>
      Error Message: {error.message}
    </>
  )

};