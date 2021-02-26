import Link from 'next/link';
import Head from 'next/head'
import { useAccount } from '../context/accountContext'
import { Login, RegisterAccount } from '../components'
const { URL_PATHS: { Owner_Products_Index_Page, Owner_Index_Page, Products_Index_Page }} = require('../util/constants/urlPaths')

export default function Home() {
  let { account } = useAccount()

  return (
    <div className="container">
      <Head>
        <title>Next.js Starter!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
       <h1>Welcome to my app!</h1>
        <p className="description">
          Get started by editing <code>pages/index.js</code>
        </p>

        {account && 
          <div>
            You are logged in! 
            {account && <> Welcome {account?.data?.email}!</>}
            <br/>
            {
              account &&
              <>
                <Link href={Owner_Index_Page}>
                  <a>Owner Home Page</a>
                </Link>
                <br />
                <Link href={Owner_Products_Index_Page}>
                  <a>All Owner Products</a>
                </Link>
              </>
            }
          </div>
        }
        <br/>
        <Link href={Products_Index_Page}>
            <a>All Products</a>
        </Link>
        <br/>
        <Login />
        <br/>
        <RegisterAccount />
      </main>
    </div>
  )
}
