import toast from 'react-hot-toast';
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup';
import { CALL_FAUNA_FUNCTION } from "../../../../util/requests"
import { useAccount } from '../../../../context/accountContext'
import { handleFaunaResults, handleFaunaError, getId } from '../../../../util/helpers'
import { createProductSchema, } from '../../../../validators'
const { FUNCTIONS: { Create_Product }} = require('../../../../util/constants/database/functions')
const { URL_PATHS: { Owner_Product_Index_Page, Owner_Index_Page}} = require('../../../../util/constants/urlPaths')

const CreateProductPage = () => {
  const { register, handleSubmit, errors } = useForm({ 
    resolver: yupResolver(createProductSchema)
  })
  const accountContext = useAccount()
  const shopId = accountContext.shopId
  const router = useRouter()

  if (!shopId) router.push(Owner_Index_Page)

  const createProduct = async (formData) => {
    const toastId = toast.loading("Loading")
    try {
      const { name, price, quantity } = formData
      let results = await CALL_FAUNA_FUNCTION(Create_Product, accountContext.accessToken, createProductSchema, {
        shopId,
        name,
        price,
        quantity
      })
      handleFaunaResults({
        results,
        toastId,
        redirectUrl: Owner_Product_Index_Page({
          shopId,
          productId: getId(results.product)
        }),
        router
      })
    }
    catch (e){
      handleFaunaError(accountContext, e, toastId)
    }
  }

  return (
    <>
      <h1>Create New Product</h1>
      <form onSubmit={handleSubmit(createProduct)}>
        <label htmlFor="name">Name</label>
        <input name="name" ref={register} />
        {errors.name && errors.name.message}

        <label htmlFor="price">Price</label>
        <input name="price" ref={register} />
        {errors.price && errors.price.message}

        <label htmlFor="quantity">Quantity</label>
        <input name="quantity" ref={register} />
        {errors.quantity && errors.quantity.message}
        
        <input type="submit" value="Create Product" />
      </form>
      <br/>
    </>
  );
};

export default CreateProductPage