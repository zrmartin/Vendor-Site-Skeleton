import React from 'react';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { render } from 'test-utils';
import '@testing-library/jest-dom/extend-expect'
import { Authenticate } from '../../components'
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

beforeAll(() => {
  jest.resetModules()
  server.listen()
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('User is authenticated then component is displayed', async () => {
  const { findByText } = render(<Authenticate Component={TestComponent}/>)

  // Display Component
  expect(await findByText('Hello Owner')).toBeInTheDocument()
});

test('User Refresh Token has expired and must login again', async () => {
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
  const { findByText } = render(<Authenticate Component={TestComponent}/>)

  // Session has expired
  expect(await findByText('Your session has expired, please login again')).toBeInTheDocument()
});

test('User is not logged in and is trying to view role-restircted page', async () => {
  server.use(
    rest.get('http://localhost:3000/api/refreshFaunaToken', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          body: {}
        })
      )
    })
  )
  const { findByText } = render(<Authenticate Component={TestComponent}/>)

  // User does not have specified role
  expect(await findByText('Please login to view this page')).toBeInTheDocument()
});

test('User does not have role/permission to view page', async () => {
  server.use(
    rest.get('http://localhost:3000/api/refreshFaunaToken', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          body: {
            secret: "abc-123",
            account: {
              data: {
                email: "test@test.com",
                roles: []
              }
            }
          }
        })
      )
    })
  )
  const { findByText } = render(<Authenticate Component={TestComponent}/>)

  // Session has expired
  expect(await findByText('You do not have permission to access to this page')).toBeInTheDocument()
});

