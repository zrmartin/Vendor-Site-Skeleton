import { Toaster } from 'react-hot-toast';
import { ChakraProvider } from "@chakra-ui/react"
import { AccountProvider } from '../context/accountContext'
import { Authenticate, ErrorBoundary, Navbar } from '../components';
import { Box } from "@chakra-ui/react"

function Application({ Component, pageProps }) {
  return (
    <>
    <ChakraProvider>
      <AccountProvider>
          <Toaster/>
          <ErrorBoundary>
            <Navbar/> 
            <Box maxWidth={"80em"} mx={["30", "30", "30", "30", "auto"]}>
              <Authenticate Component={Component} {...pageProps}/>
            </Box>
          </ErrorBoundary>
        </AccountProvider>
    </ChakraProvider>
    </>
  )
}

export default Application
