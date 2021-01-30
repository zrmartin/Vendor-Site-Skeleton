import netlifyAuth from '../netlifyAuth.js'
import { useUser } from '../context/userContext'
import { GET } from "../util/requests"

export const Logout = () => {
  let { setUser } = useUser()

  let logout = () => {
    netlifyAuth.signout(async () => {
      setUser(null)

      await GET("logout")
    })
  }

  return (
    <button onClick={logout}>
      Logout
    </button>
  )
};