import useSWR from 'swr'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { CALL_FAUNA_FUNCTION } from "../../../util/requests"
import { useUser } from '../../../context/userContext'
import { getId, getCollection, getPrice, showToast, showFetchToastError } from '../../../util/helpers'
import { HttpError, ServerError, DropZone } from '../../../components'
import { editProductSchema, getProductSchema, deleteProductSchema } from '../../../validators'
const { FUNCTIONS: { Get_Product, Delete_Product, Update_Product, Create_Images }} = require('../../../util/constants/database/functions')
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

  const product = data.data

  const createProductImages = async (imageKeys) => {
    try{
      // Mutate before and set product images to the imageKeys
      let results = await CALL_FAUNA_FUNCTION(Create_Images, accessToken, setAccessToken, null, {
        entityId: getId(product),
        entityCollection: getCollection(product),
        imageKeys
      })
      showToast(results)
      // Empty Mutate
    }
    catch (e){
      showFetchToastError(e.message)
    }
  }
  
  const deleteProduct = async (id) => {
    try{
      let results = await CALL_FAUNA_FUNCTION(Delete_Product, accessToken, setAccessToken, deleteProductSchema, {
        id
      })
      showToast(results)
      if (results.code === Success) {
        router.push('/owner/products')
      }
    }
    catch (e){
      showFetchToastError(e.message)
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
      let results = await CALL_FAUNA_FUNCTION(Update_Product, accessToken, setAccessToken, editProductSchema, {
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
          <br/><br/>
          <DropZone createProductImages={createProductImages}/>
      </>
  );
};

export default ProductPage