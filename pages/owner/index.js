import Link from 'next/link';
const { URL_PATHS: { Products_Index_Page }} = require('../../util/constants/urlPaths')
const OwnerHome = () =>  {
  return (
    <>
      <h1>Hello Owner</h1>
      <Link href="/">
        <a>Home</a> 
      </Link>
      <Link href={Products_Index_Page}>
        <a>Products</a> 
      </Link>
    </>
  )
}

export default OwnerHome