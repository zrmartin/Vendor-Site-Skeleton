import Link from 'next/link';
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { useAccount } from '../../../../context/accountContext'
import { HttpError, ServerError, Loading } from '../../../../components'
import { CALL_FAUNA_FUNCTION } from "../../../../util/requests"
import { getShopSchema } from '../../../../validators'
const { HTTP_CODES: { Success }} = require ('../../../../util/constants/httpCodes')
const { URL_PATHS: { Owner_Products_Index_Page }} = require('../../../../util/constants/urlPaths')
const { FUNCTIONS: { Get_Shop }} = require('../../../../util/constants/database/functions')

const OwnerShopIndex = () =>  {
  const accountContext = useAccount()
  const router = useRouter()
  const { shopId } = router.query
  const { data, mutate, error } = useSWR(
    [Get_Shop, accountContext.accessToken, getShopSchema, shopId], 
    (url, token, validator, id) => 
    CALL_FAUNA_FUNCTION(
      url, token, validator, { id }
    )
  )

  if (error) return <ServerError error={error}/>
  if (!data) return <Loading/>
  if (data.code !== Success) return <HttpError error={data}/>

  const shop = data.shop
  return (
    <>
      <h1>This is shop { shop.data.name }</h1>
      <Link href={Owner_Products_Index_Page({
        shopId
      })}>
        <a>View Products</a> 
      </Link>
    </>
  )
}

export default OwnerShopIndex