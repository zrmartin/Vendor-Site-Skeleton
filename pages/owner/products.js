/* Make a table with alternating color rows
   Each row will have a small image of the product, name, price, quantity, description
*/
import useSWR from 'swr'
import { FUNCTIONS } from '../../util/constants/functions'
import { CALL_FAUNA_FUNCTION } from "../../util/requests"
import { useUser } from '../../context/userContext'
const ProductsPage = () => {
  let { accessToken, setAccessToken } = useUser()
  let { Get_All_Products } = FUNCTIONS
  const { data, error } = useSWR([Get_All_Products, accessToken], CALL_FAUNA_FUNCTION)

  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>
  setAccessToken(data.accessToken)
  let results = data.data

  return (
      <>
          <h1>Products</h1>
          {
            results.map(item =>
              <div key={item.ref.id}>{item.data.name} - price ${item.data.price} - quantity - {item.data.quantity}</div>
            )
          }

      </>
  );
};

export default ProductsPage