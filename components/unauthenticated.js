import { LoginRegisterModal } from '../components'
import { useRouter } from 'next/router'
import NextLink from "next/link"
import { Heading, Link } from "@chakra-ui/react"
export const Unauthenticated = ({ message, showLogin }) => {
  const router = useRouter()
  return (
    <>
      {showLogin ? (
        <LoginRegisterModal onClose={() => {router.back()}} isOpen={true} message={message}/>
      ) : (
        <>
          <Heading>{message}</Heading>
          <Link onClick={() => {router.back()}}>Click here to go Back</Link>
        </>
      )}
    </>
  )
}