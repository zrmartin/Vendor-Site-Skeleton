import toast from 'react-hot-toast';
const { HTTP_CODES: { Unauthenticated }} = require('./constants/httpCodes')
const { REDUCERS: { Remove_Access_Token }} = require('./constants/reducers')

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


export const handleFaunaResults = async ({results, toastId, mutate = null, redirectUrl = null, router = null }) => {
  if (results.message) {
    toast.success(results.message, {
      id: toastId
    })
  }
  else {
    toast.dismiss(toastId)
  }
  if (mutate) mutate()
  if (redirectUrl && router){
      router.push(redirectUrl)
  }
}

export const handleFaunaError = (dispatch, error, toastId) => {
  if(error.status === Unauthenticated && localStorage.getItem("loggedIn")){
    dispatch({type: Remove_Access_Token})
  }
  else {
    if (error.message) {
      toast.error(error.message, {
        id: toastId
      })
    }
    else {
      toast.dismiss(toastId)
    }
  }
}