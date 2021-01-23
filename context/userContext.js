import React, { createContext, useContext, useState } from 'react'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(undefined)
  const [accessToken, setAccessToken] = useState(undefined)

  const context = {
    user,
    setUser,
    accessToken,
    setAccessToken,
  }
  return <UserContext.Provider value={context}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)