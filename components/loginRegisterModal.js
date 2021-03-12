import { 
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Heading, Input, Button,
  FormErrorMessage, FormLabel, FormControl,
  Tabs, TabList, TabPanels, Tab, TabPanel
} from "@chakra-ui/react"
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form'
import { useAccount } from '../context/accountContext'
import { POST, CALL_FAUNA_FUNCTION } from "../util/requests"
import { handleFaunaResults, handleFaunaError, getId } from '../util/helpers'
import { registerSchema } from '../validators'
const { VERCEL_FUNCTIONS: { LogIn }} = require ('../util/constants/vercelFunctions')
const { FUNCTIONS: { Register, Create_Shopping_Cart }} = require ('../util/constants/database/functions')

export const LoginRegisterModal = ({onClose, isOpen, message}) => {
  let accountContext = useAccount()
  const { 
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    errors: loginErrors
  } = useForm()
  const { 
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    errors: registerErrors
  } = useForm({
    resolver: yupResolver(registerSchema)
  })

  let login = async (formData) => {
    const toastId = toast.loading("Loading")
    try {
      const { email, password } = formData
      let loginResult = await POST(LogIn, {
        email,
        password,
      })
      handleFaunaResults({
        results: loginResult,
        toastId,
      })
      accountContext.setAccessToken(loginResult.secret)
      accountContext.setAccount(loginResult.account)
      localStorage.setItem("loggedIn", true)
      onClose()
    }
    catch (e){
      handleFaunaError(accountContext, e, toastId)
    }
  }

  
  let registerNewUser = async (formData) => {
    const { email, password } = formData
    const toastId = toast.loading("Loading")
    try {
      let registerResult = await CALL_FAUNA_FUNCTION(Register, process.env.NEXT_PUBLIC_FAUNADB_SECRET, null, {
        email,
        password,
        roles: ["guest"]
      })
      handleFaunaResults({
        results: registerResult,
        toastId,
      })
      await CALL_FAUNA_FUNCTION(Create_Shopping_Cart, process.env.NEXT_PUBLIC_FAUNADB_SECRET, null, {
        accountId: getId(registerResult.account)
      })
      login({
        email,
        password
      })
      onClose()
    }
    catch (e){
      handleFaunaError(accountContext, e, toastId)
    }
  }

  return (
    <>
      <Modal data-testid="modal" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent w={["90%", "100%"]}>
          {message ? (
            <ModalHeader mr={12}>{message}</ModalHeader>
          ) : (
            <></>    
          )}
          <ModalCloseButton />
          <ModalBody>
          <Tabs>
            <TabList>
              <Tab>Login</Tab>
              <Tab>Sign Up</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <form onSubmit={handleLoginSubmit(login)}>
                  <FormControl isInvalid={loginErrors.email}>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <Input
                      name="email"
                      ref={loginRegister}
                    />
                    <FormErrorMessage>
                      {loginErrors.email && loginErrors.email.message}
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={loginErrors.password}>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <Input
                      name="password"
                      type="password"
                      ref={loginRegister}
                    />
                    <FormErrorMessage>
                      {loginErrors.password && loginErrors.password.message}
                    </FormErrorMessage>
                  </FormControl>
                  <Button data-testid="login" mt={4} colorScheme="teal" type="submit">
                    Login
                  </Button>
                </form>
              </TabPanel>
              <TabPanel>
                <form onSubmit={handleRegisterSubmit(registerNewUser)}>
                  <FormControl isInvalid={registerErrors.email}>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <Input
                      name="email"
                      ref={registerRegister}
                    />
                    <FormErrorMessage>
                      {registerErrors.email && registerErrors.email.message}
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={registerErrors.password}>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <Input
                      name="password"
                      type="password"
                      ref={registerRegister}
                    />
                    <FormErrorMessage>
                      {registerErrors.password && registerErrors.password.message}
                    </FormErrorMessage>
                  </FormControl>
                  <Button data-testid="login" mt={4} colorScheme="teal" type="submit">
                    Sign Up
                  </Button>
                </form>
              </TabPanel>
            </TabPanels>
          </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>



  )
};