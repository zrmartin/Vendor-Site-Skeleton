import React, { createContext, useContext, useState } from 'react'

const AccountContext = createContext()

export const AccountProvider = ({ children }) => {
  const [account, setAccount] = useState(undefined)
  const [accessToken, setAccessToken] = useState(undefined)
  const [busy, setBusy] = useState(false)
  const [shopId, setShopId] = useState(undefined)
  const [shoppingCartId, setShoppingCartId] = useState(undefined)

  const context = {
    account,
    setAccount,
    accessToken,
    setAccessToken,
    setBusy,
    busy,
    shopId,
    setShopId,
    shoppingCartId,
    setShoppingCartId
  }
  return <AccountContext.Provider value={context}>{children}</AccountContext.Provider>
}

export const useAccount = () => useContext(AccountContext)