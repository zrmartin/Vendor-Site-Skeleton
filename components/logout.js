import { toast } from 'react-toastify'
import { GET } from "../util/requests"
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
      toast.error(e.message)
    }
  }

  return (
    <button onClick={logout}>
      Logout
    </button>
  )
};