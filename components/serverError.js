import toast from 'react-hot-toast';
import { useEffect } from 'react'
import { useAccount } from '../context/accountContext';
import { handleFaunaError } from '../util/helpers'

export const ServerError = ({ error }) => {
  const accountContext = useAccount();

  useEffect(() => {
    const toastId = toast.loading("Loading")
    handleFaunaError(accountContext, error, toastId)
  }, [])

  return (
    <>
      An Error Occured
      <br/>
      <p data-testid="errorStatus">Status Code: {error.status}</p>
      <br/>
      <p data-testid="errorMessage">Error Message: {error.message}</p>
    </>
  )

};