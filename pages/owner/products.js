/* Make a table with alternating color rows
   Each row will have a small image of the product, name, price, quantity, description
*/
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { FUNCTIONS } from '../../util/constants/functions'
import { CALL_FAUNA_FUNCTION } from "../../util/requests"
import { useUser } from '../../context/userContext'

const ProductsPage = () => {
  const router = useRouter()
  const { accessToken, setAccessToken } = useUser()
  const { Get_All_Products, Delete_Product } = FUNCTIONS
  const { data, error } = useSWR([Get_All_Products, accessToken], CALL_FAUNA_FUNCTION)
  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>

  setAccessToken(data.accessToken)
  const products =data.data

  const deleteProduct = async (id) => {
    try{
      let results = await CALL_FAUNA_FUNCTION(Delete_Product, accessToken, {
        id
      })
      setAccessToken(results.accessToken)
      router.reload()
    }
    catch (e){
      console.log(e)
    }
  }

  return (
      <>
          <h1>Products</h1>
          {
            products?.map(product =>
              <div key={product.ref['@ref'].id}>
                {product.data.name} - price ${product.data.price} - quantity - {product.data.quantity}
                <button onClick={() => deleteProduct(product.ref['@ref'].id)}>Delete</button>
              </div>
            
            )
          }

      </>
  );
};

export default ProductsPage