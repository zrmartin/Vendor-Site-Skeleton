import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup';
import { CALL_FAUNA_FUNCTION } from "../../../util/requests"
import { useAccount } from '../../../context/accountContext'
import { handleFaunaResults, handleFaunaError, getId } from '../../../util/helpers'
import { createProductSchema, } from '../../../validators'
const { FUNCTIONS: { Create_Shop }} = require('../../../util/constants/database/functions')
const { URL_PATHS: { Owner_Index_Page, Owner_Shop_Index_Page }} = require('../../../util/constants/urlPaths')

const CreateShopPage = () => {
  const { register, handleSubmit, errors } = useForm()
  const accountContext = useAccount()
  const router = useRouter()

  const createShop = async (formData) => {
    const { name } = formData
    const toastId = toast.loading("Loading")
    try {
      let results = await CALL_FAUNA_FUNCTION(Create_Shop, accountContext.accessToken, null, {
        name
      })

      handleFaunaResults({
        results,
        toastId,
        redirectUrl: Owner_Shop_Index_Page({
          shopId: getId(results.shop)
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
      <h1>Create New Shop</h1>
      <Link href={Owner_Index_Page}>
        <a>Owner Home Page</a>
      </Link>
      <br/>
      <br/>
      <form onSubmit={handleSubmit(createShop)}>
        <label htmlFor="name">Name</label>
        <input name="name" ref={register} />
        {errors.name && errors.name.message}
        
        <input type="submit" value="Create Shop" />
      </form>
      <br/>
    </>
  );
};

export default CreateShopPage