import React from 'react';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { render, fireEvent } from 'test-utils';
import '@testing-library/jest-dom/extend-expect'
import { Login } from '../../components'
global.fetch = require('isomorphic-fetch');

const server = setupServer(
  rest.post('http://localhost:3000/api/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.cookie('refreshToken', 'abc-123'),
      ctx.json({
        body: {
          secret: "abc-123",
          account: {
            data: {
              email: "test@test.com"
            }
          }
        }
      })
    )
  }),
  rest.get('http://localhost:3000/api/logout', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.cookie("refreshToken", "", {maxAge: -1}),
      ctx.json({
        body: {}
      })
    )
  }),
)

beforeAll(() => {
  server.listen()
  jest.resetModules()
  process.env = {
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000"
  };
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
 
test('Successfully logs user in and out and sets cookie/localStorage', async () => {
  const { findByText } = render(<Login />)

  // Login
  expect(await findByText('Login')).toBeInTheDocument()
  fireEvent.click(await findByText('Login'))
  expect(await findByText('Logout')).toBeInTheDocument()

  // Cookie is set
  expect(document.cookie).toMatch(/refreshToken=abc-123/i)

  // Local Storage is set
  expect(localStorage.getItem('loggedIn')).not.toEqual(null)

  // Logout
  fireEvent.click(await findByText('Logout'))
  expect(await findByText('Login')).toBeInTheDocument()

  // Cookie is deleted
  expect(document.cookie).not.toMatch(/refreshToken=abc-123/i)

  // Local Storage is removed
  expect(localStorage.getItem('loggedIn')).toEqual(null)
});

test('Invalid Credentails Succesfully displays toast', async () => {
  const errorMessage = "Invalid Credentials"
  server.use(
    rest.post('http://localhost:3000/api/login', (req, res, ctx) => {
      return res(
        ctx.status(401),
        ctx.json({
          message: errorMessage
        })
      )
    })
  )

  const { findByText } = render(<Login />)

  // Login
  expect(await findByText('Login')).toBeInTheDocument()
  fireEvent.click(await findByText('Login'))

  // Invalid Credentials Toast
  expect(await findByText(errorMessage)).toBeInTheDocument()

  // Local Storage is not set
  expect(localStorage.getItem('loggedIn')).toEqual(null)
});
