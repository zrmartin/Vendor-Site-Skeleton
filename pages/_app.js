import '@styles/globals.css'
import { UserProvider } from '../context/userContext'

function Application({ Component, pageProps }) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  )
}

export default Application
