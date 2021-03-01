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
          query: {
            shopId: 123
          },
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
            ref: {
              ['@ref']: {
                id: 123
              }
            },
            data: {
              email: "test@test.com",
              roles: ["owner"]
            }
          }
        }
      })
    )
  }),
  rest.post('http://localhost:3000/api/callFunction', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        body: {
          shop: {
            data: {
              account: {
                ['@ref']: {
                  id: 123
                }
              }
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

test('Refresh Token throws an error I.E User is not logged in', async () => {
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

  expect(await findByText('Please login to view this page')).toBeInTheDocument()
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

  expect(await findByText('You do not have permission to access to this page')).toBeInTheDocument()
});

test('User is trying to access a shop that is not theirs', async () => {
  server.use(
    rest.get('http://localhost:3000/api/refreshFaunaToken', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          body: {
            secret: "abc-123",
            account: {
              ref: {
                ['@ref']: {
                  id: 123
                }
              },
              data: {
                email: "test@test.com",
                roles: ["owner"]
              }
            }
          }
        })
      )
    }),
    rest.post('http://localhost:3000/api/callFunction', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          body: {
            shop: {
              data: {
                account: {
                  ['@ref']: {
                    id: "456"
                  }
                }
              }
            }
          }
        })
      )
    })
  )
  const { findByText } = render(<Authenticate Component={TestComponent}/>)

  expect(await findByText('You do not have permission to access to this page')).toBeInTheDocument()
});

