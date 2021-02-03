import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { FUNCTIONS } from '../../../util/constants/database/functions'
import { CALL_FAUNA_FUNCTION } from "../../../util/requests"
import { useUser } from '../../../context/userContext'

const NewProductPage = () => {
  const { register, handleSubmit, errors } = useForm();
  const router = useRouter()
  const { accessToken, setAccessToken } = useUser()
  const { Create_Product } = FUNCTIONS

  const createProduct = async (formData) => {
    try{
      const { name, price, quantity } = formData

      let results = await CALL_FAUNA_FUNCTION(Create_Product, accessToken, {
        name,
        price,
        quantity
      })
      
      setAccessToken(results.accessToken)
      router.push('/owner/products')
    }
    catch (e){
      console.log(e)
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