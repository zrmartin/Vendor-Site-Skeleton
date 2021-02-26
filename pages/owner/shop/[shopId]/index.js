import Link from 'next/link';
import { useRouter } from 'next/router'
const { URL_PATHS: { Owner_Products_Index_Page }} = require('../../../../util/constants/urlPaths')
const OwnerShopIndex = () =>  {
  const router = useRouter()
  const { shopId } = router.query
  return (
    <>
      <h1>This is shop { shopId }</h1>
    </>
  )
}

export default OwnerShopIndex