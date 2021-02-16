import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { useAccount } from '../context/accountContext'
import { POST } from "../util/requests"
const { VERCEL_FUNCTIONS: { LogIn }} = require ('../util/constants/vercelFunctions')

export const Login = () => {
  let { setAccessToken, setAccount, setSessionExpired } = useAccount()
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
      setSessionExpired(false)
    }
    catch (e) {
      toast.error(e.message)
    }
  }

  return (
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
  )
};