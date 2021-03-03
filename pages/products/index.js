import useSWR from 'swr'
import Link from 'next/link';
import { CALL_FAUNA_FUNCTION } from "../../util/requests"
import { getId, getPrice } from '../../util/helpers'
import { HttpError, ServerError, Loading } from '../../components'
const { FUNCTIONS: { Get_All_Products }} = require('../../util/constants/database/functions')
const { HTTP_CODES: { Success }} = require ('../../util/constants/httpCodes')
const { URL_PATHS: { Product_Index_Page }} = require('../../util/constants/urlPaths')

const ProductsHome = () => {
  const { data, error } = useSWR([Get_All_Products, process.env.NEXT_PUBLIC_FAUNADB_SECRET], CALL_FAUNA_FUNCTION)
  if (error) return <ServerError error={error}/>
  if (!data) return <Loading/>
  if (data.code !== Success) return <HttpError error={data}/>

  const products = data.products

  return (
      <>
          <h1>Products</h1>
          <br/>
          {
            products?.map(product =>
              <div key={getId(product)}>
                <Link href={Product_Index_Page(getId(product))}>
                  <a>{product.data.name}</a>
                </Link>
                 - price ${getPrice(product.data.price)} - quantity - {product.data.quantity}
              </div>
            )
          }
      </>
  );
};

export default ProductsHome