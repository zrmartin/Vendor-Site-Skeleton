import Link from 'next/link';
const { URL_PATHS: { Owner_Products_Index_Page }} = require('../../util/constants/urlPaths')
const OwnerHome = () =>  {
  return (
    <>
      <h1>Hello Owner</h1>
      <Link href="/">
        <a>Home</a> 
      </Link>
      <Link href={Owner_Products_Index_Page}>
        <a>Products</a> 
      </Link>
    </>
  )
}

export default OwnerHome