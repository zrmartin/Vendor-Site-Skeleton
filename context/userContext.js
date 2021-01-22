import React, { createContext, useContext, useState } from 'react'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(undefined)

  const context = {
    user,
    setUser,
  }
  return <UserContext.Provider value={context}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)