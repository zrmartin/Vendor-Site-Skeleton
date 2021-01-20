import { useEffect, useState } from 'react'
import netlifyAuth from '../netlifyAuth.js'
import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'

export default function Home() {
  let [loggedIn, setLoggedIn] = useState(netlifyAuth.isAuthenticated)
  let [user, setUser] = useState(null)
  
  useEffect(() => {
    netlifyAuth.initialize((user) => {
      setLoggedIn(!!user)
      setUser(user)
    })
  }, [loggedIn])
  
  let login = () => {
    netlifyAuth.authenticate((user) => {
      setLoggedIn(!!user)
      setUser(user)
      netlifyAuth.closeModal()
    })
  }
  
  let logout = () => {
    netlifyAuth.signout(() => {
      setLoggedIn(false)
      setUser(null)
    })
  }

  return (
    <div className="container">
      <Head>
        <title>Next.js Starter!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header title="Welcome to my app!" />
        <p className="description">
          Get started by editing <code>pages/index.js</code>
        </p>

        {loggedIn ? (
          <div>
            You are logged in!
            {user && <>Welcome {user?.user_metadata.full_name}!</>}
            <button onClick={logout}>
              Log out here.
            </button>
          </div>
        ) : (
          <button onClick={login}>
            Log in here.
          </button>
        )}
      </main>

      <Footer />
    </div>
  )
}
