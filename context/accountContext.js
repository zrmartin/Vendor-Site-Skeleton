import React, { createContext, useContext, useMemo, useReducer } from 'react'

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
    case "setBusy": 
      return {
        ...state,
        busy: true
      }
    case "setShopId": 
      return {
        ...state,
        shopId: results.shopId
      }
    case "setShoppingCartQuantity": 
      return {
        ...state,
        shoppingCartQuantity: results.shoppingCartQuantity
      }
    case 'setAll':
        return {
          account: results.account,
          accessToken: results.accessToken,
          shopId: results.shopId,
          shoppingCartId: results.shoppingCartId,
          shoppingCartQuantity: results.shoppingCartQuantity,
          busy: false
        }
    case 'removeAccessToken':
      return {
        ...state,
        accessToken: undefined
      }
    case 'login':
      localStorage.setItem("loggedIn", true)
      return {
        ...state,
        account: results.account,
        accessToken: results.accessToken
      }   
    case 'logout':
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