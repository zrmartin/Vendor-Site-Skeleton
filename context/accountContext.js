import React, { createContext, useContext, useMemo, useReducer } from 'react'
const { REDUCERS: {Set_Busy, Set_Shop_Id, Set_Shopping_Cart_Quantity, Set_All, Remove_Access_Token, Login, Logout }} = require('../util/constants/reducers')

const AccountContext = createContext()
const initialState = {
  account: undefined,
  accessToken: undefined,
  busy: false,
  shopId: undefined,
  shoppingCartId: undefined,
  shoppingCartQuantity: undefined,
}
const reducer = (state, action) => {
  const { results } = action
  switch (action.type) {
    case Set_Busy: 
      return {
        ...state,
        busy: true
      }
    case Set_Shop_Id: 
      return {
        ...state,
        shopId: results.shopId
      }
    case Set_Shopping_Cart_Quantity: 
      return {
        ...state,
        shoppingCartQuantity: results.shoppingCartQuantity
      }
    case Set_All:
        return {
          account: results.account,
          accessToken: results.accessToken,
          shopId: results.shopId,
          shoppingCartId: results.shoppingCartId,
          shoppingCartQuantity: results.shoppingCartQuantity,
          busy: false
        }
    case Remove_Access_Token:
      return {
        ...state,
        accessToken: undefined
      }
    case Login:
      localStorage.setItem("loggedIn", true)
      return {
        ...state,
        account: results.account,
        accessToken: results.accessToken
      }   
    case Logout:
      localStorage.removeItem("loggedIn")
      return {
        account: undefined,
        accessToken: undefined,
        shopId: undefined,
        shoppingCartId: undefined,
        shoppingCartQuantity: undefined,
        busy: false
      }
    default:
      return state
  }
}

export const AccountProvider = ({ children }) => {
  const [accountContext, dispatch] = useReducer(reducer, initialState)
  const contextValue = useMemo(() => {
    return { accountContext, dispatch };
  }, [accountContext, dispatch]);

  return <AccountContext.Provider value={contextValue}>{children}</AccountContext.Provider>
}

export const useAccount = () => useContext(AccountContext)