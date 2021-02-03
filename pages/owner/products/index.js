/* Make a table with alternating color rows
   Each row will have a small image of the product, name, price, quantity, description
*/
import useSWR from 'swr'
import Link from 'next/link';
import { FUNCTIONS } from '../../../util/constants/database/functions'
import { CALL_FAUNA_FUNCTION } from "../../../util/requests"
import { useUser } from '../../../context/userContext'
import { getId, getPrice } from '../../../util/helpers'

const ProductsHome = () => {
  const { accessToken, setAccessToken } = useUser()
  const { Get_All_Products, Delete_Product } = FUNCTIONS
  // data is the name of the object returned from the useSWR data fetch
  const { data, mutate, error } = useSWR([Get_All_Products, accessToken], CALL_FAUNA_FUNCTION)
  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>

  // Product info return from fauna db is store in a data object
  const products = data.data
  setAccessToken(data.accessToken)

  const deleteProduct = async (id) => {
    try{
      // Create new list of products without the one we just deleted
      const updatedProducts = products.filter(product => getId(product) !== id)
      // set the useSWR data object equal to itself,
      // then update the data field which contains all of the products returned from faunadb
      mutate({ ...data, data: updatedProducts }, false)

      let results = await CALL_FAUNA_FUNCTION(Delete_Product, accessToken, {
        id
      })
      setAccessToken(results.accessToken)
      mutate()
    }
    catch (e){
      console.log(e)
    }
  }

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
                <button onClick={() => deleteProduct(getId(product))}>Delete</button>
              </div>
            
            )
          }
      </>
  );
};

export default ProductsHome