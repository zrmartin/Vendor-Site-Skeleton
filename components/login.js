import netlifyAuth from '../netlifyAuth.js'
import { useUser } from '../context/userContext'
import { POST } from "../util/requests"
import { showFetchToastError } from "../util/helpers"
const { NETLIFY_FUNCTIONS: { LogIn }} = require ('../util/constants/netlifyFunctions')

export const Login = () => {
  let { setAccessToken } = useUser()

  let login = () => {
    try {
      let results = await POST(LogIn, {
        email: user.email,
        password: process.env.SHOP_OWNER_PASSWORD
      })
      setAccessToken(results.secret)
    }
    catch (e) {
      showFetchToastError(e.message)
    }
  }

  return (
    <button onClick={login}>
      Login
    </button>
  )
};