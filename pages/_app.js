import '@styles/globals.css'
import { UserProvider } from '../context/userContext'
import { Authenticate } from '../components/Authenticate';

function Application({ Component, pageProps }) {
  return (
    <UserProvider>
      <Authenticate Component={Component} {...pageProps}/>
    </UserProvider>
  )
}

export default Application
