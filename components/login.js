import netlifyAuth from '../netlifyAuth.js'
import { useUser } from '../context/userContext'
import { POST } from "../util/requests"
const { NETLIFY_FUNCTIONS: { LogIn }} = require ('../util/constants/netlifyFunctions')

export const Login = () => {
  let { setUser, setAccessToken } = useUser()

  let login = () => {
    netlifyAuth.authenticate(async (user) => {
      setUser(user)

      let results = await POST(LogIn, {
        email: user.email,
        password: process.env.SHOP_OWNER_PASSWORD
      })
      // Need error checking to see if results came back with valid data
      setAccessToken(results.secret)
    })
  }

  return (
    <button onClick={login}>
      Login
    </button>
  )
};