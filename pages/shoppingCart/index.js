import Link from 'next/link';
import useSWR from 'swr'
import { useAccount } from '../../context/accountContext'
import { HttpError, ServerError, Loading, LoginRegisterModal } from '../../components'
import { CALL_FAUNA_FUNCTION } from "../../util/requests"
import { getId, getPrice, handleFaunaResults, handleFaunaError } from '../../util/helpers'
const { HTTP_CODES: { Success, Unauthenticated }} = require ('../../util/constants/httpCodes')
const { FUNCTIONS: { Get_Shopping_Cart_Products_For_Account, Remove_Product_From_Shopping_Cart, Clear_Shopping_Cart }} = require('../../util/constants/database/functions')
const { URL_PATHS: { Products_Index_Page }} = require('../../util/constants/urlPaths')

const ShoppingCartHome = () =>  {
  const accountContext = useAccount()
  const { data, mutate, error } = useSWR(
    [Get_Shopping_Cart_Products_For_Account, accountContext.accessToken], 
    (url, token) => 
    CALL_FAUNA_FUNCTION(
      url, token
    )
  )

  if (error && error.status === Unauthenticated) return <LoginRegisterModal show={true} setShow={() => {}}message={"Please login to view your shopping cart"}/>
  if (error) return <ServerError error={error}/>
  if (!data) return <Loading />
  if (data.code !== Success) return <HttpError error={data}/>

  const shoppingCart = data.shoppingCart

  const removeFromCart = async (productId) => {
    try{
      const updatedShoppingCart = shoppingCart.filter(item => getId(item.product) !== productId )
      console.log(updatedShoppingCart)
      mutate({ ...data, shoppingCart: updatedShoppingCart}, false)
      let results = await CALL_FAUNA_FUNCTION(Remove_Product_From_Shopping_Cart, accountContext.accessToken, null, {
        id: accountContext.shoppingCartId,
        productId
      })
      handleFaunaResults(results)
      mutate()
    }
    catch (e){
      handleFaunaError(accountContext, e)
    }
  }

  const clearCart = async () => {
    try{
      const updatedShoppingCart = []
      mutate({ ...data, shoppingCart: updatedShoppingCart}, false)
      let results = await CALL_FAUNA_FUNCTION(Clear_Shopping_Cart, accountContext.accessToken, null, {
        id: accountContext.shoppingCartId
      })
      handleFaunaResults(results)
      mutate()
    }
    catch (e){
      handleFaunaError(accountContext, e)
    }
  }


  return (
    <>
      <h1>Shopping Cart</h1>
      {shoppingCart.length > 0 ? (
        <>
          <button onClick={() => clearCart()}>Clear Cart</button><br/><br/>
          {
            shoppingCart.map(item => 
              <div key={getId(item.product)}>
                Name - {item.product.data.name}<br/>
                quantity - {item.quantity}<br/>
                price - ${getPrice(item.product.data.price * item.quantity)}<br/>
                <button onClick={() => removeFromCart(getId(item.product))}>Remove From Cart</button><br/><br/>
              </div>
            )
          }
        </>
      ) : (
        <>
          <p>
            Your shopping cart is empty<br/>
            <Link href={Products_Index_Page}>
              <a>Click Here </a>
             </Link>
             to view products
          </p>
        </>
      )}

    </>
  )
}

export default ShoppingCartHome