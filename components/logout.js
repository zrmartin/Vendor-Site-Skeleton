import { GET } from "../util/requests"
const { NETLIFY_FUNCTIONS: { LogOut }} = require ('../util/constants/netlifyFunctions')

export const Logout = () => {
  let logout = async () => {
    try {
      await GET(LogOut)
    }
    catch (e) {
      showFetchToastError(e.message)
    }
  }

  return (
    <button onClick={logout}>
      Logout
    </button>
  )
};