import useSWR from 'swr'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { FUNCTIONS } from '../../../util/constants/database/functions'
import { HTTP_CODES } from '../../../util/constants/httpCodes'
import { CALL_FAUNA_FUNCTION } from "../../../util/requests"
import { useUser } from '../../../context/userContext'
import { getId, getPrice, showToast } from '../../../util/helpers'
import { HttpError } from '../../../components'

const ProductPage = () => {
  const { register, handleSubmit, errors } = useForm();
  const router = useRouter()
  const { productId } = router.query
  const { accessToken, setAccessToken } = useUser()
  const { Get_Product, Delete_Product, Update_Product } = FUNCTIONS
  const { Success } = HTTP_CODES
  // data is the name of the object returned from the useSWR data fetch
  const { data, mutate, error } = useSWR(
    [Get_Product, accessToken, productId], 
    (url, token, id) => 
    CALL_FAUNA_FUNCTION(
      url, token, { id }
    )
  )
  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>
  if (data.code !== Success) return <HttpError error={data}/>

  setAccessToken(data.accessToken)
  const product = data.data

  const deleteProduct = async (id) => {
    try{
      let results = await CALL_FAUNA_FUNCTION(Delete_Product, accessToken, {
        id
      })

      setAccessToken(results.accessToken)
      router.push('/owner/products')
    }
    catch (e){
      console.log(e)
    }
  }

  const editProduct = async ({ name, price, quantity }) => {
    try{
      const updatedProduct = {
        ...product,
        name,
        price,
        quantity
      }
      mutate({ ...data, data: updatedProduct}, false)

      let results = await CALL_FAUNA_FUNCTION(Update_Product, accessToken, {
        id: getId(product),
        name,
        price,
        quantity
      })
      
      showToast(results)
      if (results.code === Success) {
        setAccessToken(results.accessToken)
        mutate()
        router.push('/owner/products')
      }
    }
    catch (e){
      console.log(e)
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