import Link from 'next/link';
import useSWR from 'swr'
import { useAccount } from '../../context/accountContext'
import { HttpError, ServerError, Loading, LoginRegisterModal } from '../../components'
import { CALL_FAUNA_FUNCTION } from "../../util/requests"
import { getId, getPrice } from '../../util/helpers'
const { HTTP_CODES: { Success, Unauthenticated }} = require ('../../util/constants/httpCodes')
const { FUNCTIONS: { Get_Shopping_Cart_Products_For_Account }} = require('../../util/constants/database/functions')
const { URL_PATHS: {  }} = require('../../util/constants/urlPaths')

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

  return (
    <>
      <h1>Shopping Cart</h1>
      {
        shoppingCart.map(item => 
          <div key={getId(item.product)}>
            Name - {item.product.data.name}<br/>
            quantity - {item.quantity}<br/>
            price - ${getPrice(item.product.data.price * item.quantity)}<br/><br/>
          </div>
        )
      }
    </>
  )
}

export default ShoppingCartHome