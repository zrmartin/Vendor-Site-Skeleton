import useSWR from 'swr'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router'
import { CALL_FAUNA_FUNCTION, POST } from "../../../../../util/requests"
import { useAccount } from '../../../../../context/accountContext'
import { getId, getCollection, getPrice, handleFaunaResults, handleFaunaError } from '../../../../../util/helpers'
import { HttpError, DropZone, ServerError } from '../../../../../components'
import { updateProductSchema, getProductSchema, deleteProductSchema, createImagesSchema, deleteImageSchema } from '../../../../../validators'
const { FUNCTIONS: { Get_Product, Delete_Product, Update_Product, Create_Images, Delete_Image }} = require('../../../../../util/constants/database/functions')
const { VERCEL_FUNCTIONS: { Delete_S3_Files }} = require ('../../../../../util/constants/vercelFunctions')
const { HTTP_CODES: { Success }} = require ('../../../../../util/constants/httpCodes')
const { URL_PATHS: { Owner_Products_Index_Page }} = require('../../../../../util/constants/urlPaths')

const OwnerProductPage = () => {
  const { register, handleSubmit, errors } = useForm({ 
    resolver: yupResolver(updateProductSchema)
  })
  const accountContext = useAccount()
  const router = useRouter()
  const { productId } = router.query

  const { data, mutate, error } = useSWR(
    [Get_Product, accountContext.accessToken, getProductSchema, productId], 
    (url, token, validator, id) => 
    CALL_FAUNA_FUNCTION(
      url, token, validator, { id }
    )
  )
  if (error) return <div><ServerError error={error}/></div>
  if (!data) return <div>loading...</div>
  if (data.code !== Success) return <HttpError error={data}/>

  const product = data.product
  const images = data.images

  const createProductImages = async (imageKeys) => {
    try{
      let results = await CALL_FAUNA_FUNCTION(Create_Images, accountContext.accessToken, createImagesSchema, {
        entityId: getId(product),
        entityCollection: getCollection(product),
        imageKeys
      })
      handleFaunaResults(results, mutate)
    }
    catch (e){
      handleFaunaError(accountContext, e)
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
        if (s3Results.Errors.length > 0){
          s3Results.Errors.forEach(
            error => toast.error(error.message)
          )
        }
      }

      let databaseResults = await CALL_FAUNA_FUNCTION(Delete_Product, accountContext.accessToken, deleteProductSchema, {
        id
      })
      handleFaunaResults(databaseResults, mutate, Owner_Products_Index_Page, router)
    }
    catch (e){
      handleFaunaError(accountContext, e)
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
      let results = await CALL_FAUNA_FUNCTION(Update_Product, accountContext.accessToken, updateProductSchema, {
        id: getId(product),
        name,
        price,
        quantity
      })
      handleFaunaResults(results, mutate, Owner_Products_Index_Page, router)
    }
    catch (e){
      handleFaunaError(accountContext, e)
    }
  }

  const deleteImage = async (id) => {
    try{
      const imageKeys = images.filter(image => (
        getId(image) === id
      )).map(image => (
        image.data.key
      ))

      if (imageKeys.length > 0) {
        let s3Results = await POST(Delete_S3_Files, {
          imageKeys
        })
        if (s3Results.Errors.length > 0){
          s3Results.Errors.forEach(
            error => toast.error(error.message)
          )
        }
      }

      let databaseResults = await CALL_FAUNA_FUNCTION(Delete_Image, accountContext.accessToken, deleteImageSchema, {
        id
      })
      handleFaunaResults(databaseResults, mutate)
    }
    catch (e){
      handleFaunaError(accountContext, e)
    }
  }


  return (
      <>
          <h1>Update {product.data.name}</h1>
          <form onSubmit={handleSubmit(updateProduct)}>
            <input hidden name="id" ref={register} defaultValue={getId(product)}/>
            {errors.id && errors.id.message}

            <label htmlFor="name">Name</label>
            <input name="name" ref={register} defaultValue={product.data.name}/>
            {errors.name && errors.name.message}

            <label htmlFor="price">Price</label>
            <input name="price" ref={register} defaultValue={getPrice(product.data.price)}/>
            {errors.price && errors.price.message}

            <label htmlFor="quantity">Quantity</label>
            <input name="quantity" ref={register} defaultValue={product.data.quantity}/>
            {errors.quantity && errors.quantity.message}

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
                <button onClick={() => deleteImage(getId(image))}>Delete</button>
              </div>
            )
          }
      </>
  );
};

export default OwnerProductPage