import Head from 'next/head'

export default function Home() {
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
