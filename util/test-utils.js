import React from 'react'
import { render } from '@testing-library/react'
import { Toaster } from 'react-hot-toast';
import { AccountProvider } from '../context/accountContext'

const AllTheProviders = ({ children }) => {
  return (
    <AccountProvider>
      <Toaster />
      {children}
    </AccountProvider>
  )
}

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }