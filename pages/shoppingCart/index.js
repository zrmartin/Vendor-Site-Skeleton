import { useState, useEffect } from 'react'
import toast from 'react-hot-toast';
import Link from 'next/link';
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { useAccount } from '../../context/accountContext'
import { ServerError, Loading, LoginRegisterModal, QuantitySelector } from '../../components'
import { CALL_FAUNA_FUNCTION } from "../../util/requests"
import { getId, getPrice, handleFaunaResults, handleFaunaError } from '../../util/helpers'
const { HTTP_CODES: { Success, Unauthenticated }} = require ('../../util/constants/httpCodes')
const { FUNCTIONS: { Get_Shopping_Cart_Products_For_Account, Remove_Product_From_Shopping_Cart, Clear_Shopping_Cart, Update_Shopping_Cart }} = require('../../util/constants/database/functions')
const { URL_PATHS: { Products_Index_Page, Checkout_Index_Page }} = require('../../util/constants/urlPaths')
const { REDUCERS: { Set_Shopping_Cart_Quantity }} = require('../../util/constants/reducers')

const ShoppingCartHome = () =>  {
  const router = useRouter()
  const [shoppingCartQuantities, setShoppingCartQuantities] = useState({})
  const { accountContext, dispatch }= useAccount()

  const { data, mutate, error } = useSWR(
    [Get_Shopping_Cart_Products_For_Account, accountContext.accessToken], 
    (url, token) => 
    CALL_FAUNA_FUNCTION(
      url, token
    )
  )
  useEffect(() => {
    if (data?.shoppingCart) {
      dispatch({
        type: Set_Shopping_Cart_Quantity,
        results: {
          shoppingCartQuantity: data.shoppingCart.length
        }
      })
    }
    
  }, [data])

  if (error && error.status === Unauthenticated){
    return <LoginRegisterModal onClose={() => {router.back()}} isOpen={true} message={"Please login to view your shopping cart"}/>
  } 
  if (error) return <ServerError error={error}/>
  if (!data) return <Loading />

  const shoppingCart = data.shoppingCart

  const removeFromCart = async (productId) => {
    const toastId = toast.loading("Loading")
    try {
      const updatedShoppingCart = shoppingCart.filter(item => getId(item.product) !== productId )
      mutate({ ...data, shoppingCart: updatedShoppingCart}, false)
      let results = await CALL_FAUNA_FUNCTION(Remove_Product_From_Shopping_Cart, accountContext.accessToken, null, {
        id: accountContext.shoppingCartId,
        productId
      })
      handleFaunaResults({
        results,
        toastId,
        mutate
      })
    }
    catch (e){
      handleFaunaError(dispatch, e, toastId)
    }
  }

  const clearCart = async () => {
    const toastId = toast.loading("Loading")
    try {
      const updatedShoppingCart = []
      mutate({ ...data, shoppingCart: updatedShoppingCart}, false)
      let results = await CALL_FAUNA_FUNCTION(Clear_Shopping_Cart, accountContext.accessToken, null, {
        id: accountContext.shoppingCartId
      })
      handleFaunaResults({
        results,
        toastId,
        mutate
      })
    }
    catch (e){
      handleFaunaError(dispatch, e, toastId)
    }
  }
  
  const updateShoppingCart = async () => {
    const toastId = toast.loading("Loading")
    try {
      const updatedShoppingCart = shoppingCart.map((item) => {
        const quantity = shoppingCartQuantities[getId(item.product)]
        if (quantity) {
          return {
            product: item.product,
            quantity: shoppingCartQuantities[getId(item.product)]
          }
        }
        else {
          return {
            product: item.product,
            quantity: item.quantity
          }
        }

      })
      mutate({ ...data, shoppingCart: updatedShoppingCart}, false)
      let results = await CALL_FAUNA_FUNCTION(Update_Shopping_Cart, accountContext.accessToken, null, {
        id: accountContext.shoppingCartId,
        products: shoppingCartQuantities
      })
      handleFaunaResults({
        results,
        toastId,
        mutate
      })
    }
    catch (e){
      handleFaunaError(dispatch, e, toastId)
    }
  }

  return (
    <>
      <h1>Shopping Cart</h1>
      {shoppingCart.length > 0 ? (
        <>
          <button onClick={() => clearCart()}>Clear Cart</button><br/><br/>
          <Link href={Checkout_Index_Page}>
            <a>Checkout</a>
          </Link>
          <br/>
          <br/>
          {shoppingCart.map(item => 

            <div key={getId(item.product)}>
              Name - {item.product.data.name}<br/>
              <QuantitySelector 
                name={getId(item.product)} 
                quantity={item.quantity} 
                setQuantity={(quantity) => setShoppingCartQuantities({...shoppingCartQuantities, [getId(item.product)]: quantity})} 
                maxQuantity={item.product.data.quantity}
              />
              <br/>
              price - ${
                shoppingCartQuantities[getId(item.product)] ? 
                getPrice(item.product.data.price * shoppingCartQuantities[getId(item.product)]) :
                getPrice(item.product.data.price * item.quantity)
              }<br/>
              <button onClick={() => removeFromCart(getId(item.product))}>Remove From Cart</button><br/><br/>
            </div>
          )}
          
          <button onClick={() => updateShoppingCart()}>Save</button>
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