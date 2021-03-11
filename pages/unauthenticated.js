import { LoginRegisterModal } from '../components'
import { useRouter } from 'next/router'

const UnauthenticatedPage = ({ message, showLogin }) => {
  const router = useRouter()
  return (
    <>
      {showLogin ? (
        <LoginRegisterModal onClose={() => {router.back()}} isOpen={true} message={message}/>
      ) : (
        <h3>{message}</h3>
      )
      }
    </>
  )
}

export default UnauthenticatedPage