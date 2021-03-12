import useSWR from 'swr'
import Link from 'next/link';
import { useRouter } from 'next/router'
import { CALL_FAUNA_FUNCTION } from "../../../util/requests"
import { ServerError, Loading } from '../../../components'
const { FUNCTIONS: { Get_Shop_By_Name }} = require('../../../util/constants/database/functions')
const { URL_PATHS: { Shop_Products_Page }} = require('../../../util/constants/urlPaths')

const ShopHome = () => {
  const router = useRouter()
  const { shopName } = router.query
  const { data, error } = useSWR(
    [Get_Shop_By_Name, process.env.NEXT_PUBLIC_FAUNADB_SECRET, null, shopName], 
    (url, token, validator, name) => 
    CALL_FAUNA_FUNCTION(
      url, token, validator, { name }
    )
  )
  if (error) return <ServerError error={error}/>
  if (!data) return <Loading/>
  const shop = data.shop

  return (
      <>
        <h1>{shop.data.name}</h1>
        <br/>
        <Link href={Shop_Products_Page({shopName})}>
          <a>View Products</a> 
        </Link>
      </>
  );
};

export default ShopHome