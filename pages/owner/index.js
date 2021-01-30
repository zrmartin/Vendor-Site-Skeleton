import Link from 'next/link';
export default function OwnerHome() {
  return (
    <>
      <h1>Hello Owner</h1>
      <Link href="/">
        <a>Home</a> 
      </Link>
    </>
  )
}