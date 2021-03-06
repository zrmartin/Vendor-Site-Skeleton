import React from 'react';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { render, fireEvent } from 'test-utils';
import '@testing-library/jest-dom/extend-expect'
import { ServerError, Authenticate } from '../../components'
global.fetch = require('isomorphic-fetch');
 
jest.mock("next/router", () => ({
  useRouter() {
      return {
          route: "/",
          pathname: "/owner",
          query: "",
          asPath: "",
      };
  },
}));

const TestComponent = () =>  {
  return (
    <>
      <h1>Hello Owner</h1>
    </>
  )
}

const server = setupServer(
  rest.get('http://localhost:3000/api/refreshFaunaToken', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        body: {
          secret: "abc-123",
          account: {
            data: {
              email: "test@test.com",
              roles: ["owner"]
            }
          }
        }
      })
    )
  })
)

beforeEach(() => {
  localStorage.clear();
});
beforeAll(() => {
  server.listen()
  jest.resetModules()
  process.env = {
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000"
  };
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('Succesfully display non-unauthenticated error message', async () => {
  const error = {
    status: 404,
    message: "Not Found"
  }
  const { findByTestId } = render(<ServerError error={error}/>)

  // Error Details displayed
  expect(await findByTestId("errorStatus")).toHaveTextContent(error.status)
  expect(await findByTestId("errorMessage")).toHaveTextContent(error.message)
});

test('Succesfully refreshes Access Token if error is un-authenticated and displays component', async () => {
  localStorage.setItem('loggedIn', true)
  const { findByText } = render(
    <Authenticate Component={TestComponent}>
      <ServerError/>
    </Authenticate>
  )

  // Display Component
  expect(await findByText('Hello Owner')).toBeInTheDocument()
});

test('Succesfully displays session timeout if error is un-authenticated and refreshToken is expired', async () => {
  localStorage.setItem('loggedIn', true)
  server.use(
    rest.get('http://localhost:3000/api/refreshFaunaToken', (req, res, ctx) => {
      return res(
        ctx.status(401),
        ctx.json({
          body: {}
        })
      )
    })
  )

  const { findByText } = render(
    <Authenticate Component={TestComponent}>
      <ServerError/>
    </Authenticate>
  )

  // Session has expired
  expect(await findByText('Please login to view this page')).toBeInTheDocument()
});
