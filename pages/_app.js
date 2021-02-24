import '@styles/globals.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AccountProvider } from '../context/accountContext'
import { Authenticate, ErrorBoundary } from '../components';

function Application({ Component, pageProps }) {
  return (
    <>
      <AccountProvider>
        <ToastContainer />
        <ErrorBoundary>
          <Authenticate Component={Component} {...pageProps}/>
        </ErrorBoundary>
      </AccountProvider>
    </>
  )
}

export default Application
