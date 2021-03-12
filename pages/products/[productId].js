import { useDisclosure } from "@chakra-ui/react"
import toast from 'react-hot-toast';
import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link';
import { useRouter } from 'next/router'
import { useAccount } from '../../context/accountContext'
import { CALL_FAUNA_FUNCTION } from "../../util/requests"
import { getId, getPrice, handleFaunaResults } from '../../util/helpers'
import { ServerError, Loading, QuantitySelector, LoginRegisterModal } from '../../components'
import { getProductSchema } from '../../validators'
const { FUNCTIONS: { Get_Product, Add_Product_To_Shopping_Cart }} = require('../../util/constants/database/functions')
const { HTTP_CODES: { Success }} = require ('../../util/constants/httpCodes')
const { URL_PATHS: { Products_Index_Page, Shopping_Cart_Index_Page }} = require('../../util/constants/urlPaths')

const ProductHome = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [quantity, setQuantity] = useState(1)
  const { accountContext } = useAccount()
  const router = useRouter()
  const { productId } = router.query
  const { data, mutate, error } = useSWR(
    [Get_Product, process.env.NEXT_PUBLIC_FAUNADB_SECRET, getProductSchema, productId], 
    (url, token, validator, id) => 
    CALL_FAUNA_FUNCTION(
      url, token, validator, { id }
    )
  )
  if (error) return <ServerError error={error}/>
  if (!data) return <Loading/>

  const product = data.product
  const images = data.images

  const addToCart = async () => {
    const toastId = toast.loading("Loading")
    try {
      let results = await CALL_FAUNA_FUNCTION(Add_Product_To_Shopping_Cart, accountContext.accessToken, null, {
        id: accountContext.shoppingCartId,
        productId: getId(product),
        quantity
      })
      handleFaunaResults({
        results, 
        toastId, 
        router,
        redirectUrl: Shopping_Cart_Index_Page, 
      })
    }
    catch (e){
      onOpen()
      toast.dismiss(toastId)
    }
  }

  return (
      <>
          <h1>{product.data.name}</h1>
          <br/>
          <Link href={Products_Index_Page}>
            <a>All Products</a>
          </Link>
          <br/>
          <div>
            Price - ${product.data.price}
            <br/>
            <QuantitySelector quantity={quantity} setQuantity={setQuantity} maxQuantity={product.data.quantity}/>
            <button onClick={() => addToCart()}>Add To Cart</button>
          </div>
          {
            images?.map(image =>
              <div key={getId(image)}>
                <img src={`${process.env.NEXT_PUBLIC_S3_URL_PREFIX}${image.data.key}`} style={{ width: 100, height: 100 }}/>
              </div>
            )
          }
          <LoginRegisterModal onClose={onClose} isOpen={isOpen} message={"Please login to add this product to your cart"}/>

      </>
  );
};

export default ProductHome