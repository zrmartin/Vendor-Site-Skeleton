import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form'
import { useAccount } from '../context/accountContext'
import { CALL_FAUNA_FUNCTION, POST } from "../util/requests"
import { handleFaunaResults, getId, handleFaunaError} from '../util/helpers'
const { FUNCTIONS: { Create_Shopping_Cart, Register }} = require ('../util/constants/database/functions')
const { VERCEL_FUNCTIONS: { LogIn }} = require ('../util/constants/vercelFunctions')

export const RegisterAccount = () => {
  let accountContext = useAccount()
  const { register, handleSubmit, errors } = useForm()

  let registerNewUser = async (formData) => {
    const { email, password } = formData
    const toastId = toast.loading("Loading")
    try {
      let registerResult = await CALL_FAUNA_FUNCTION(Register, process.env.NEXT_PUBLIC_FAUNADB_SECRET, null, {
        email,
        password,
        roles: ["guest"]
      })
      handleFaunaResults({
        results: registerResult,
        toastId,
      })
      await CALL_FAUNA_FUNCTION(Create_Shopping_Cart, process.env.NEXT_PUBLIC_FAUNADB_SECRET, null, {
        accountId: getId(registerResult.account)
      })
      let results = await POST(LogIn, {
        email,
        password,
      })
      accountContext.setAccessToken(results.secret)
      accountContext.setAccount(results.account)
      localStorage.setItem("loggedIn", true)
    }
    catch (e){
      handleFaunaError(accountContext, e, toastId)
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
    </>
  )
}