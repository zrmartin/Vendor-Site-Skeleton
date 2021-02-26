import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { useAccount } from '../context/accountContext'
import { POST } from "../util/requests"
import { handleFaunaResults } from '../util/helpers'
const { VERCEL_FUNCTIONS: { Register }} = require ('../util/constants/vercelFunctions')

export const RegisterAccount = () => {
  let { setAccessToken, setAccount, setSessionExpired, account, accessToken } = useAccount()
  const { register, handleSubmit, errors } = useForm()

  let registerNewUser = async (formData) => {
    try {
      const { email, password } = formData
      let results = await POST(Register, {
        email,
        password,
        roles: ["guest"]
      })
      console.log(results)
      handleFaunaResults(results)
    }
    catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(registerNewUser)}>
      <label htmlFor="email">Email</label>
      <input name="email" ref={register} />

      <label htmlFor="password">Password</label>
      <input name="password" ref={register} />
      
      <input type="submit" value="Sign Up" />
      </form>
      <br />
    </>
  )
}