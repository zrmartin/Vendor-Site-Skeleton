import Link from 'next/link';
import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'
import { useUser } from '../context/userContext'
import {  CALL_FAUNA_FUNCTION } from "../util/requests"
import { FUNCTIONS } from"../util/constants/functions"
import { Login, Logout } from '../components'

export default function Home() {
  let { user, accessToken, setAccessToken } = useUser()
  let { Create_Product } = FUNCTIONS

  let createProduct = async () => {
    let results = await CALL_FAUNA_FUNCTION(Create_Product, accessToken, {
      name: "Test Product",
      price: 123456,
      quantity: 900
    })
    setAccessToken(results.accessToken)
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
              <>
                <Link href="/owner">
                  <a>Edit Store</a>
                </Link>
                <br/ >
                <Link href="/owner/products">
                  <a>Products</a>
                </Link>
              </>
            }
            <br/>
            <Logout></Logout>
            <button onClick={createProduct}>
            Create Product
          </button>
          </div>
        ) : (
          <Login></Login>
        )}
      </main>

      <Footer />
    </div>
  )
}
