import Link from 'next/link';
import useSWR from 'swr'
import { useAccount } from '../../context/accountContext'
import { ServerError, Loading } from '../../components'
import { CALL_FAUNA_FUNCTION } from "../../util/requests"
import { getId } from '../../util/helpers'
const { HTTP_CODES: { Success }} = require ('../../util/constants/httpCodes')
const { FUNCTIONS: { Get_Shop_For_Account }} = require('../../util/constants/database/functions')
const { URL_PATHS: { Owner_Shop_Index_Page, Owner_Products_Index_Page, Owner_Shop_Create_Page }} = require('../../util/constants/urlPaths')
const OwnerHome = () =>  {
  const { accountContext } = useAccount()
  const { data, mutate, error } = useSWR(
    [Get_Shop_For_Account, accountContext.accessToken], 
    (url, token) => 
    CALL_FAUNA_FUNCTION(
      url, token
    )
  )

  if (error) return <ServerError error={error}/>
  if (!data) return <Loading />
  const shop = data.shop

  return (
    <>
      {shop?.data ? (
        <>
          <h1>Hello Owner</h1>
          <Link href="/">
            <a>Home</a> 
          </Link>
          <br/>
          <br/>
          <Link href={Owner_Shop_Index_Page}>
            <a>View Store</a> 
          </Link>
          <br/>
          <br/>
          <Link href={Owner_Products_Index_Page}>
            <a>View Products</a> 
          </Link>
        </>
      ) : (
        <>
          <p>You have not created a shop yet.</p>
          <Link href={Owner_Shop_Create_Page}>
            <a>Click Here </a> 
          </Link>
          to create one
        </>
      )}
    </>
  )
}

export default OwnerHome