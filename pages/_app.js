import '@styles/globals.css'
import { UserProvider } from '../context/userContext'
import { Authenticate } from '../components/authenticate';

function Application({ Component, pageProps }) {
  return (
    <UserProvider>
      <Authenticate Component={Component} {...pageProps}/>
    </UserProvider>
  )
}

export default Application
