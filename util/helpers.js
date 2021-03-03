import { toast } from 'react-toastify'
const { HTTP_CODES: { Success, Unauthenticated }} = require('./constants/httpCodes')

export function getCookie(cookie, name) {
  var match = cookie?.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) {
    return match[2];
  }
  else{
    return null;
  }
}

export const getId = (obj) => {
  if (obj?.ref?.['@ref']?.id) {
    return obj.ref['@ref'].id
  }
  else if (obj?.['@ref']?.id) {
    return obj['@ref'].id
  }
  return undefined
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
    if (redirectUrl && router) router.push(redirectUrl)
  }
  else {
    if (results.message) {
      toast.error(results.message)
    }
  }
}

export const handleFaunaError = (accountContext, error) => {
  if(error.status === Unauthenticated && localStorage.getItem("loggedIn")){
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