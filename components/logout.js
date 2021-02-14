import netlifyAuth from '../netlifyAuth.js'
import { useUser } from '../context/userContext'
import { GET } from "../util/requests"
const { NETLIFY_FUNCTIONS: { LogOut }} = require ('../util/constants/netlifyFunctions')

export const Logout = () => {
  let { setUser } = useUser()

  let logout = () => {
    netlifyAuth.signout(async () => {
      setUser(null)
      try {
        await GET(LogOut)
      }
      catch (e) {
        showFetchToastError(e.message)
      }

    })
  }

  return (
    <button onClick={logout}>
      Logout
    </button>
  )
};