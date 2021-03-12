import Link from 'next/link';
import Head from 'next/head'
import { useAccount } from '../context/accountContext'
const { URL_PATHS: { Owner_Index_Page, Products_Index_Page, Shopping_Cart_Index_Page }} = require('../util/constants/urlPaths')

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
      </main>
    </div>
  )
}
