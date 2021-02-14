import useSWR from 'swr'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { CALL_FAUNA_FUNCTION, POST } from "../../../util/requests"
import { useUser } from '../../../context/userContext'
import { getId, getCollection, getPrice, showToast, showFetchToastError } from '../../../util/helpers'
import { HttpError, ServerError, DropZone } from '../../../components'
import { updateProductSchema, getProductSchema, deleteProductSchema } from '../../../validators'
const { FUNCTIONS: { Get_Product, Delete_Product, Update_Product, Create_Images }} = require('../../../util/constants/database/functions')
const { NETLIFY_FUNCTIONS: { Delete_S3_Files }} = require ('../../../util/constants/netlifyFunctions')
const { HTTP_CODES: { Success }} = require ('../../../util/constants/httpCodes')

const ProductPage = () => {
  const { register, handleSubmit, errors } = useForm();
  const { accessToken, setAccessToken } = useUser()
  const router = useRouter()
  const { productId } = router.query


  const { data, mutate, error } = useSWR(
    [Get_Product, accessToken, setAccessToken, getProductSchema, productId], 
    (url, token, setToken, validator, id) => 
    CALL_FAUNA_FUNCTION(
      url, token, setToken, validator, { id }
    )
  )
  if (error) return <div><ServerError error={error}/></div>
  if (!data) return <div>loading...</div>
  if (data.code !== Success) return <HttpError error={data}/>

  const product = data.product
  const images = data.images

  const createProductImages = async (imageKeys) => {
    try{
      let results = await CALL_FAUNA_FUNCTION(Create_Images, accessToken, setAccessToken, null, {
        entityId: getId(product),
        entityCollection: getCollection(product),
        imageKeys
      })
      showToast(results)
      mutate()
    }
    catch (e){
      showFetchToastError(e.message)
    }
  }
  
  const deleteProduct = async (id) => {
    try{
      const imageKeys = images.map(image => (
          image.data.key
      ))
      /* Results looks like
        {
          "Deleted":[
            {"Key":"490d8204-ef3e-428f-86d9-532c66d5eda3"}
          ],
          "Errors":[]
        }
      */
      if (imageKeys.length > 0) {
        let s3Results = await POST(Delete_S3_Files, {
          imageKeys
        })
      }

      let databaseResults = await CALL_FAUNA_FUNCTION(Delete_Product, accessToken, setAccessToken, deleteProductSchema, {
        id
      })
      showToast(databaseResults)
      if (databaseResults.code === Success) {
        router.push('/owner/products')
      }
    }
    catch (e){
      showFetchToastError(e.message)
    }
  }

  const updateProduct = async ({ name, price, quantity }) => {
    try{
      const updatedProduct = {
        ...product,
        data: {
          name,
          price,
          quantity
        }
      }
      mutate({ ...data, product: updatedProduct}, false)
      let results = await CALL_FAUNA_FUNCTION(Update_Product, accessToken, setAccessToken, updateProductSchema, {
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
      showFetchToastError(e.message)
    }
  }

  return (
      <>
          <h1>Update {product.data.name}</h1>
          <form onSubmit={handleSubmit(updateProduct)}>
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
          <br/><br/>
          <DropZone createProductImages={createProductImages}/>
          <br/><br/>
          {
            images?.map(image =>
              <div key={getId(image)}>
                <img src={`${process.env.NEXT_PUBLIC_S3_URL_PREFIX}${image.data.key}`} style={{ width: 100, height: 100 }}/>
              </div>
            )
          }
      </>
  );
};

export default ProductPage