import { toast } from 'react-toastify'
const { HTTP_CODES: { Success, Not_Found ,Validation_Error }} = require('./constants/httpCodes')

export const getId = (obj) => {
 return obj?.ref['@ref']?.id
}

export const getPrice = (price) => {
  return `${price/100}`
}

export const showToast = (data) => {
  switch(data.code) {
    case Success:
      if (data.message) toast.success(data.message)
      break
    case Not_Found:
    case Validation_Error:
      if (data.message) toast.error(data.message)
      break
  }
}

export const showFetchToastError = () => {
  toast.error("Could not reach server, please try again. If this issue persists please contact Admin")
}