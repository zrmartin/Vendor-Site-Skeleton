import React from 'react';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { render, fireEvent, waitFor, act } from 'test-utils';
import '@testing-library/jest-dom/extend-expect'
import { Login } from '../components'
global.fetch = require('isomorphic-fetch');

//https://github.com/vercel/next.js/issues/16864
jest.mock('next/link', () => ({ children }) => children);

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

//TODO Check for cookie being set correctly
test('Successfully logs user in and out and sets cookie', async () => {
  const { getByText } = render(<Login />)

  // Login
  expect(getByText('Login')).toBeInTheDocument()
  act(() => {
    fireEvent.click(getByText('Login'))
  })
  await waitFor(() => getByText('Logout'))
  expect(getByText('Logout')).toBeInTheDocument()

  // Cookie is set
  expect(document.cookie).toMatch(/refreshToken=abc-123/i)

  // Logout
  act(() => {
    fireEvent.click(getByText('Logout'))
  })
  await waitFor(() => getByText('Login'))
  expect(getByText('Login')).toBeInTheDocument()

  // Cookie is deleted
  expect(document.cookie).not.toMatch(/refreshToken=abc-123/i)
});
