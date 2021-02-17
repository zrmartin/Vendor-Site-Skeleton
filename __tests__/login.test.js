import React from 'react';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { render, fireEvent, waitFor, act } from 'test-utils';
import '@testing-library/jest-dom/extend-expect'
import Home from '../pages'
global.fetch = require('isomorphic-fetch');

//https://github.com/vercel/next.js/issues/16864
jest.mock('next/link', () => ({ children }) => children);

const server = setupServer(
  rest.post('http://localhost:3000/api/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        body: {
          secret: "accessToken",
          account: {
            data: {
              email: "test@test.com"
            }
          }
        }
      })
    )
  })
)

beforeAll(() => {
  server.listen()
  jest.resetModules()
  process.env = {
    SITE_URL: "http://localhost:3000"
  };
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

//TODO Check for cookie being set correctly
test('Successfully logs user in and updates page to display logout', async () => {
  const { getByText } = render(
      <Home />
  )

  expect(getByText('Login')).toBeInTheDocument()
  act(() => {
    fireEvent.click(getByText('Login'))
  })
  await waitFor(() => getByText('Logout'))

  expect(getByText('Logout')).toBeInTheDocument()
});
