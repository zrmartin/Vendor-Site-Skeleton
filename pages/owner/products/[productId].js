import useSWR from 'swr'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { CALL_FAUNA_FUNCTION } from "../../../util/requests"
import { useUser } from '../../../context/userContext'
import { getId, getPrice, showToast, showFetchToastError } from '../../../util/helpers'
import { HttpError, ServerError } from '../../../components'
const { FUNCTIONS: {Get_Product, Delete_Product, Update_Product }} = require('../../../util/constants/database/functions')
const { HTTP_CODES: { Success }} = require ('../../../util/constants/httpCodes')

const ProductPage = () => {
  const { register, handleSubmit, errors } = useForm();
  const { accessToken, setAccessToken } = useUser()
  const router = useRouter()
  const { productId } = router.query

  const { data, mutate, error } = useSWR(
    [Get_Product, accessToken, setAccessToken, productId], 
    (url, token, setToken, id) => 
    CALL_FAUNA_FUNCTION(
      url, token, setToken, { id }
    )
  )
  if (error) return <div><ServerError error={error}/></div>
  if (!data) return <div>loading...</div>
  if (data.code !== Success) return <HttpError error={data}/>

  const product = data.data
  
  const deleteProduct = async (id) => {
    try{
      let results = await CALL_FAUNA_FUNCTION(Delete_Product, accessToken, setAccessToken, {
        id
      })
      showToast(results)
      if (results.code === Success) {
        router.push('/owner/products')
      }
    }
    catch (e){
      console.log(e)
      showFetchToastError()
    }
  }

  const editProduct = async ({ name, price, quantity }) => {
    try{
      const updatedProduct = {
        ...product,
        data: {
          name,
          price,
          quantity
        }
      }
      mutate({ ...data, data: updatedProduct}, false)
      let results = await CALL_FAUNA_FUNCTION(Update_Product, accessToken, setAccessToken, {
        id: getId(product),
        name,
        price,
        quantity
      })
      showToast(results)
      mutate()
      if (results.code === Success) {
        router.push('/owner/products')
      }
    }
    catch (e){
      console.log(e)
      showFetchToastError()
    }
  }

  return (
      <>
          <h1>Edit {product.data.name}</h1>
          <form onSubmit={handleSubmit(editProduct)}>
            <label htmlFor="name">Name</label>
            <input name="name" ref={register} defaultValue={product.data.name}/>

            <label htmlFor="price">Price</label>
            <input name="price" ref={register} defaultValue={getPrice(product.data.price)}/>

            <label htmlFor="quantity">Quantity</label>
            <input name="quantity" ref={register} defaultValue={product.data.quantity}/>

            <input type="submit" value="Save" />
          </form>
          <br/>
          <button onClick={() => deleteProduct(getId(product))}>Delete</button>
      </>
  );
};

export default ProductPage