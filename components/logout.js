import netlifyAuth from '../netlifyAuth.js'
import { useUser } from '../context/userContext'
import { GET } from "../util/requests"
const { NETLIFY_FUNCTIONS: { Logout }} = require ('../util/constants/netlifyFunctions')

export const Logout = () => {
  let { setUser } = useUser()

  let logout = () => {
    netlifyAuth.signout(async () => {
      setUser(null)

      await GET(Logout)
    })
  }

  return (
    <button onClick={logout}>
      Logout
    </button>
  )
};