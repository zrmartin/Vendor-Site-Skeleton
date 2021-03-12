import useSWR from 'swr'
import Link from 'next/link';
import { CALL_FAUNA_FUNCTION } from "../../util/requests"
import { getId, getShopNameOrId } from '../../util/helpers'
import { ServerError, Loading } from '../../components'
const { FUNCTIONS: { Get_All_Shops }} = require('../../util/constants/database/functions')
const { HTTP_CODES: { Success }} = require ('../../util/constants/httpCodes')
const { URL_PATHS: { Shop_Index_Page }} = require('../../util/constants/urlPaths')

const AllShopsHome = () => {
  const { data, error } = useSWR([Get_All_Shops, process.env.NEXT_PUBLIC_FAUNADB_SECRET], CALL_FAUNA_FUNCTION)
  if (error) return <ServerError error={error}/>
  if (!data) return <Loading/>

  const shops = data.shops

  return (
      <>
          <h1>Shops</h1>
          <br/>
          {
            shops?.map(shop =>
              <div key={getId(shop)}>
                <Link href={Shop_Index_Page({shopName: shop.data.name})}>
                  <a>{shop.data.name}</a>
                </Link>
              </div>
            )
          }
      </>
  );
};

export default AllShopsHome