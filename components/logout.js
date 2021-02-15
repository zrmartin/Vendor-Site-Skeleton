import { GET } from "../util/requests"
import { showFetchToastError } from "../util/helpers"
import { useAccount } from '../context/accountContext'
const { VERCEL_FUNCTIONS: { LogOut }} = require ('../util/constants/vercelFunctions')

export const Logout = () => {
  let { setAccessToken, setAccount } = useAccount()
  let logout = async () => {
    try {
      await GET(LogOut)
      setAccessToken(null)
      setAccount(null)
    }
    catch (e) {
      showFetchToastError(e.message)
    }
  }

  return (
    <button onClick={logout}>
      Logout
    </button>
  )
};