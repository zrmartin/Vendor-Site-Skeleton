import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { useAccount } from '../context/accountContext'
import { POST, CALL_FAUNA_FUNCTION } from "../util/requests"
import { handleFaunaResults, getId } from '../util/helpers'
const { VERCEL_FUNCTIONS: { LogIn }} = require ('../util/constants/vercelFunctions')
const { FUNCTIONS: { Register, Create_Shopping_Cart }} = require ('../util/constants/database/functions')

export const LoginRegisterModal = ({show, setShow, message}) => {
  let { setAccessToken, setAccount } = useAccount()
  const { 
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    errors: loginErrors
  } = useForm()
  const { 
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    errors: registerErrors
  } = useForm()

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
      setShow(false)
    }
    catch (e) {
      toast.error(e.message)
    }
  }

  
  let registerNewUser = async (formData) => {
    try {
      const { email, password } = formData
      let registerResult = await CALL_FAUNA_FUNCTION(Register, process.env.NEXT_PUBLIC_FAUNADB_SECRET, null, {
        email,
        password,
        roles: ["guest"]
      })
      handleFaunaResults(registerResult)
      await CALL_FAUNA_FUNCTION(Create_Shopping_Cart, process.env.NEXT_PUBLIC_FAUNADB_SECRET, null, {
        accountId: getId(registerResult.account)
      })
      login({
        email,
        password
      })
    }
    catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div data-testid="modal" style={{display: show ? "block" : "none"}}>
      <h1>{message}</h1>
      <h2>Login</h2>
      <form onSubmit={handleLoginSubmit(login)}>
        <label htmlFor="email">Email</label>
        <input name="email" ref={loginRegister} />

        <label htmlFor="password">Password</label>
        <input name="password" ref={loginRegister} />
        
        <input data-testid="login" type="submit" value="Login" />
      </form>
      <br />
      <h2>Sign Up</h2>
      <form onSubmit={handleRegisterSubmit(registerNewUser)}>
        <label htmlFor="email">Email</label>
        <input name="email" ref={registerRegister} />

        <label htmlFor="password">Password</label>
        <input name="password" ref={registerRegister} />
        
        <input data-testid="register" type="submit" value="Sign Up" />
      </form>
      <br />
    </div>
  )
};