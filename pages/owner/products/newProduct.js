import { useForm } from 'react-hook-form'
import { CALL_FAUNA_FUNCTION } from "../../../util/requests"
import { useAccount } from '../../../context/accountContext'
import { handleFaunaResults, handleFaunaError, getId } from '../../../util/helpers'
import { createProductSchema, } from '../../../validators'
const { FUNCTIONS: { Create_Product }} = require('../../../util/constants/database/functions')

const NewProductPage = () => {
  const { register, handleSubmit, errors } = useForm()
  const accountContext = useAccount()

  const createProduct = async (formData) => {
    try{
      const { name, price, quantity } = formData
      let results = await CALL_FAUNA_FUNCTION(Create_Product, accountContext.accessToken, createProductSchema, {
        name,
        price,
        quantity
      })
      handleFaunaResults(results, null, `/owner/products/${getId(results.product)}`)
    }
    catch (e){
      handleFaunaError(accountContext, e)
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