import { Toaster } from 'react-hot-toast';
import { ChakraProvider } from "@chakra-ui/react"
import { AccountProvider } from '../context/accountContext'
import { Authenticate, ErrorBoundary, Navbar } from '../components';

function Application({ Component, pageProps }) {
  return (
    <>
    <ChakraProvider>
      <AccountProvider>
          <Toaster/>
          <ErrorBoundary>
            <Navbar/>
            <Authenticate Component={Component} {...pageProps}/>
          </ErrorBoundary>
        </AccountProvider>
    </ChakraProvider>
    </>
  )
}

export default Application
