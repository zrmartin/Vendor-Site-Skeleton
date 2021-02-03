import { HTTP_CODES } from './constants/httpCodes'
import { toast } from 'react-toastify'

export const getId = (obj) => {
 return obj?.ref['@ref']?.id
}

export const getPrice = (price) => {
  return `${price/100}`
}

export const showToast = (data) => {
  const { Success, Not_Found } = HTTP_CODES
  switch(data.code) {
    case Success:
      toast.success("Saved Changes")
      break
    case Not_Found:
      toast.error("Could not update Product")

  }
}