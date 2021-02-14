import '@styles/globals.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserProvider } from '../context/userContext'
import { Authenticate, ErrorBoundary } from '../components';

function Application({ Component, pageProps }) {
  return (
    <>
      <UserProvider>
        <ToastContainer />
        <ErrorBoundary>
          <Authenticate Component={Component} {...pageProps}/>
        </ErrorBoundary>
      </UserProvider>
    </>
  )
}

export default Application
