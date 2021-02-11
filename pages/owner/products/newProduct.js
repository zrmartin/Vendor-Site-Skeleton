import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { CALL_FAUNA_FUNCTION } from "../../../util/requests"
import { useUser } from '../../../context/userContext'
import { showToast, showFetchToastError, getId } from '../../../util/helpers'
import { createProductSchema, } from '../../../validators'
const { FUNCTIONS: { Create_Product }} = require('../../../util/constants/database/functions')
const { HTTP_CODES: { Success }} = require ('../../../util/constants/httpCodes')

const NewProductPage = () => {
  const { register, handleSubmit, errors } = useForm();
  const router = useRouter()
  const { accessToken, setAccessToken } = useUser()

  const createProduct = async (formData) => {
    try{
      const { name, price, quantity } = formData
      let results = await CALL_FAUNA_FUNCTION(Create_Product, accessToken, setAccessToken, createProductSchema, {
        name,
        price,
        quantity
      })
      showToast(results)
      if (results.code === Success) {
        router.push(`/owner/products/${getId(results.data)}`)
      }
    }
    catch (e){
      showFetchToastError(e.message)
    }
  }

  return (
      <>
          <h1>Create New Product</h1>
          <form onSubmit={handleSubmit(createProduct)}>
            <label htmlFor="name">Name</label>
            <input name="name" ref={register} />

            <label htmlFor="price">Price</label>
            <input name="price" ref={register} />

            <label htmlFor="quantity">Quantity</label>
            <input name="quantity" ref={register} />
            
            <input type="submit" value="Create Product" />
          </form>
          <br/>
      </>
  );
};

export default NewProductPage