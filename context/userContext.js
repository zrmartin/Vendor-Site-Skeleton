import React, { createContext, useContext, useState, useEffect } from 'react'
import netlifyAuth from '../netlifyAuth.js'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(undefined)
  const [accessToken, setAccessToken] = useState(undefined)

  useEffect(() => {
    netlifyAuth.initialize((user) => {
      setUser(user)
    })
  }, [])

  const context = {
    user,
    setUser,
    accessToken,
    setAccessToken,
  }
  return <UserContext.Provider value={context}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)