import '@styles/globals.css'
import { Toaster } from 'react-hot-toast';
import { AccountProvider } from '../context/accountContext'
import { Authenticate, ErrorBoundary } from '../components';

function Application({ Component, pageProps }) {
  return (
    <>
      <AccountProvider>
        <Toaster/>
        <ErrorBoundary>
          <Authenticate Component={Component} {...pageProps}/>
        </ErrorBoundary>
      </AccountProvider>
    </>
  )
}

export default Application
