import useSWR from 'swr'
import Link from 'next/link';
import { useRouter } from 'next/router'
import { CALL_FAUNA_FUNCTION } from "../../../util/requests"
import { getId } from '../../../util/helpers'
import { ServerError, Loading } from '../../../components'
import { getShopSchema } from '../../../validators'
const { FUNCTIONS: { Get_Shop }} = require('../../../util/constants/database/functions')
const { HTTP_CODES: { Success }} = require ('../../../util/constants/httpCodes')
const { URL_PATHS: { Shop_Products_Page }} = require('../../../util/constants/urlPaths')

const ShopHome = () => {
  const router = useRouter()
  const { shopId } = router.query
  const { data, error } = useSWR(
    [Get_Shop, process.env.NEXT_PUBLIC_FAUNADB_SECRET, getShopSchema, shopId], 
    (url, token, validator, id) => 
    CALL_FAUNA_FUNCTION(
      url, token, validator, { id }
    )
  )
  if (error) return <ServerError error={error}/>
  if (!data) return <Loading/>

  const shop = data.shop

  return (
      <>
        <h1>{shop.data.name}</h1>
        <br/>
        <Link href={Shop_Products_Page({shopId})}>
          <a>View Products</a> 
        </Link>
      </>
  );
};

export default ShopHome