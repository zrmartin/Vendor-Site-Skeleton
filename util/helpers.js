import { toast } from 'react-toastify'
const { HTTP_CODES: { Success, Not_Found, Validation_Error, Unauthenticated, }} = require('./constants/httpCodes')

export const getId = (obj) => {
 return obj?.ref['@ref']?.id
}

export const getCollection = (obj) => {
  return obj?.ref['@ref']?.collection['@ref']?.id
 }

export const getPrice = (price) => {
  return `${price/100}`
}


export const handleFaunaResults = (results, mutate = null, redirectUrl = null, router = null) => {
  if (results.code === Success && results.message) {
    if (results.message) toast.success(results.message)
    if (mutate) mutate()
    if (redirectUrl) router.push(redirectUrl)
  }
  else {
    if (results.message) {
      toast.error(results.message)
    }
  }
}

export const handleFaunaError = (accountContext, error) => {
  if(error.status === Unauthenticated){
    accountContext.setBusy(true)
    accountContext.setAccessToken(null)
    accountContext.setAccount(null)
  }
  else {
    if (error.message) {
      toast.error(error.message)
    }
  }
}