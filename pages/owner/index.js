import Link from 'next/link';
const OwnerHome = () =>  {
  return (
    <>
      <h1>Hello Owner</h1>
      <Link href="/">
        <a>Home</a> 
      </Link>
      <Link href="/owner/products">
        <a>Products</a> 
      </Link>
    </>
  )
}

export default OwnerHome