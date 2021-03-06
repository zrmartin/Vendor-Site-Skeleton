import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form'
import { useAccount } from '../context/accountContext'
import { POST, GET } from "../util/requests"
const { VERCEL_FUNCTIONS: { LogIn, LogOut }} = require ('../util/constants/vercelFunctions')

export const Login = () => {
  let { setAccessToken, setAccount, account, accessToken, setShoppingCartId, setShopOwnerAccountId } = useAccount()
  const { register, handleSubmit, errors } = useForm()

  let login = async (formData) => {
    try {
      const { email, password } = formData
      let results = await POST(LogIn, {
        email,
        password,
      })
      setAccessToken(results.secret)
      setAccount(results.account)
      localStorage.setItem("loggedIn", true)
    }
    catch (e) {
      toast.error(e.message)
    }
  }

  let logout = async () => {
    try {
      await GET(LogOut)
      setAccessToken(null)
      setAccount(null)
      setShopOwnerAccountId(null)
      setShoppingCartId(null)
      localStorage.removeItem("loggedIn")
    }
    catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <>
      { !account || !accessToken ? (
        <>
          <form onSubmit={handleSubmit(login)}>
          <label htmlFor="email">Email</label>
          <input name="email" ref={register} />

          <label htmlFor="password">Password</label>
          <input name="password" ref={register} />
          
          <input type="submit" value="Login" />
          </form>
          <br />
        </>
      ) : (
        <>
          <button onClick={logout}>
            Logout
          </button>
        </>
      )}
    </>
  )
};