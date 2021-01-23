import { useEffect, useState } from 'react'
import netlifyAuth from '../netlifyAuth.js'
import Link from 'next/link';
import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'
import { useUser } from '../context/userContext'
import { POST } from "../util/requests"

export default function Home() {
  let [loggedIn, setLoggedIn] = useState(netlifyAuth.isAuthenticated)
  let { user, setUser, accessToken, setAccessToken } = useUser()

  useEffect(() => {
    netlifyAuth.initialize((user) => {
      setLoggedIn(!!user)
      setUser(user)
    })
  }, [loggedIn])
  
  let login = () => {
      netlifyAuth.authenticate(async (user) => {
      setLoggedIn(!!user)
      setUser(user)

      let results = await POST("login", {
        email: user.email,
        password: process.env.SHOP_OWNER_PASSWORD
      })
      // Need error checking to see if results came back with valid data
      setAccessToken(results.secret)
    })
  }

  let myLogin = async () => {
    let results = await POST("login", {
      email: user.email,
      password: process.env.SHOP_OWNER_PASSWORD
    })
    // Need error checking to see if results came back with valid data
    setAccessToken(results.secret)
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

        {user ? (
          <div>
            You are logged in! 
            {user && <> Welcome {user?.user_metadata.full_name}!</>}
            <br/>
            {
              user && user.app_metadata?.roles?.includes("owner") &&
              <Link href="/owner">
                <a>Edit Store</a>
              </Link>
            }
            <br/>
            <button onClick={logout}>
              Log out here.
            </button>
            <button onClick={myLogin}>
            My Login
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
