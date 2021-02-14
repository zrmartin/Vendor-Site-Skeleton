/* Make a table with alternating color rows
   Each row will have a small image of the product, name, price, quantity, description
*/
import useSWR from 'swr'
import Link from 'next/link';
import { CALL_FAUNA_FUNCTION } from "../../../util/requests"
import { useUser } from '../../../context/userContext'
import { getId, getPrice } from '../../../util/helpers'
import { HttpError, ServerError } from '../../../components'
const { FUNCTIONS: { Get_All_Products }} = require('../../../util/constants/database/functions')
const { HTTP_CODES: { Success }} = require ('../../../util/constants/httpCodes')

const ProductsHome = () => {
  const { accessToken, setAccessToken } = useUser()
  const { data, error } = useSWR([Get_All_Products, accessToken, setAccessToken], CALL_FAUNA_FUNCTION)
  if (error) return <div><ServerError error={error}/></div>
  if (!data) return <div>loading...</div>
  if (data.code !== Success) return <HttpError error={data}/>

  const products = data.products

  return (
      <>
          <h1>Products</h1>
          <br/>
          <Link href={`/owner/products/newProduct`}>
              <a>Create New Product</a>
          </Link>
          <br/>
          {
            products?.map(product =>
              <div key={getId(product)}>
                <Link href={`/owner/products/${getId(product)}`}>
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