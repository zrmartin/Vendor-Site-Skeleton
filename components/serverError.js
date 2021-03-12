import toast from 'react-hot-toast';
import { useEffect } from 'react'
import { useAccount } from '../context/accountContext';
import { handleFaunaError } from '../util/helpers'

export const ServerError = ({ error }) => {
  const { dispatch } = useAccount();

  useEffect(() => {
    const toastId = toast.loading("Loading")
    handleFaunaError(dispatch, error, toastId)
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