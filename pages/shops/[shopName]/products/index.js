import useSWR from 'swr'
import Link from 'next/link';
import { useRouter } from 'next/router'
import { CALL_FAUNA_FUNCTION } from "../../../../util/requests"
import { getId, getPrice } from '../../../../util/helpers'
import { ServerError, Loading } from '../../../../components'
import { getAllProductsForShopSchema } from '../../../../validators'
const { FUNCTIONS: { Get_All_Products_For_Shop }} = require('../../../../util/constants/database/functions')
const { HTTP_CODES: { Success }} = require ('../../../../util/constants/httpCodes')
const { URL_PATHS: { Shop_Product_Page }} = require('../../../../util/constants/urlPaths')

const ShopHome = () => {
  const router = useRouter()
  const { shopName } = router.query
  const { data, error } = useSWR(
    [Get_All_Products_For_Shop, process.env.NEXT_PUBLIC_FAUNADB_SECRET, null, shopName], 
    (url, token, validator, shopIdOrName) => 
    CALL_FAUNA_FUNCTION(
      url, token, validator, { shopIdOrName }
    )
  )
  if (error) return <ServerError error={error}/>
  if (!data) return <Loading/>
  const products = data.products

  return (
      <>
        <h1>Products</h1>
        <br/>
        {
            products?.map(product =>
              <div key={getId(product)}>
                <Link href={Shop_Product_Page({shopName, productId: getId(product)})}>
                  <a>{product.data.name}</a>
                </Link>
                 - price ${getPrice(product.data.price)} - quantity - {product.data.quantity}
              </div>
            )
          }
      </>
  );
};

export default ShopHome