import '@styles/globals.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserProvider } from '../context/userContext'
import { Authenticate } from '../components';

function Application({ Component, pageProps }) {
  return (
    <>
      <UserProvider>
        <ToastContainer />
        <Authenticate Component={Component} {...pageProps}/>
      </UserProvider>
    </>
  )
}

export default Application
