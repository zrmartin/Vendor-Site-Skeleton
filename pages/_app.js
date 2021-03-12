import { Toaster } from 'react-hot-toast';
import { ChakraProvider } from "@chakra-ui/react"
import { AccountProvider } from '../context/accountContext'
import { Authenticate, ErrorBoundary } from '../components';

function Application({ Component, pageProps }) {
  return (
    <>
    <ChakraProvider>
      <AccountProvider>
          <Toaster position="bottom-center"/>
          <ErrorBoundary>
            <Authenticate Component={Component} {...pageProps}/>
          </ErrorBoundary>
        </AccountProvider>
    </ChakraProvider>
    </>
  )
}

export default Application
