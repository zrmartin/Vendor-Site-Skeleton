import { useRouter } from 'next/router'
import useSWR from 'swr'
import Link from 'next/link';
import { CALL_FAUNA_FUNCTION } from "../../../../../util/requests"
import { useAccount } from '../../../../../context/accountContext'
import { getId, getPrice } from '../../../../../util/helpers'
import { HttpError, ServerError, Loading } from '../../../../../components'
import { getAllProductsForShopSchema } from '../../../../../validators'
const { FUNCTIONS: { Get_All_Products_For_Shop }} = require('../../../../../util/constants/database/functions')
const { HTTP_CODES: { Success }} = require ('../../../../../util/constants/httpCodes')
const { URL_PATHS: { Owner_Product_Index_Page, Owner_Product_Create_Page }} = require('../../../../../util/constants/urlPaths')

const OwnerProductsHome = () => {
  const accountContext = useAccount()
  const router = useRouter()
  const { shopId } = router.query

  const { data, mutate, error } = useSWR(
    [Get_All_Products_For_Shop, accountContext.accessToken, getAllProductsForShopSchema, shopId], 
    (url, token, validator, shopId) => 
    CALL_FAUNA_FUNCTION(
      url, token, validator, { shopId }
    )
  )

  if (error) return <ServerError error={error}/>
  if (!data) return <Loading/>
  if (data.code !== Success) return <HttpError error={data}/>

  const products = data.products
  
  return (
      <>
          <h1>Products</h1>
          <br/>
          <Link href={Owner_Product_Create_Page({
            shopId
          })}>
              <a>Create New Product</a>
          </Link>
          <br/>
          {
            products?.map(product =>
              <div key={getId(product)}>
                <Link href={Owner_Product_Index_Page({
                  shopId,
                  productId: getId(product)
                })}>
                  <a>{product.data.name}</a>
                </Link>
                 - price ${getPrice(product.data.price)} - quantity - {product.data.quantity}
              </div>
            )
          }
      </>
  );
};

export default OwnerProductsHome