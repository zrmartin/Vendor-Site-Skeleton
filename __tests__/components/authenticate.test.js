import React from 'react';
import { useRouter } from 'next/router'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { render } from 'test-utils';
import '@testing-library/jest-dom/extend-expect'
import { Authenticate } from '../../components'
const { FUNCTIONS: { Get_Shop, Get_Shopping_Cart_For_Account }} = require('../../util/constants/database/functions')

global.fetch = require('isomorphic-fetch');

jest.mock("next/router", () => ({
  useRouter: jest.fn() 
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
    if(req.body.functionName == Get_Shop) {
      return res(
        ctx.status(200),
        ctx.json({
          body: {
            shop: {
              data: {
                account: {
                  ['@ref']: {
                    id: "123"
                  }
                }
              }
            }
          }
        })
      )
    }
    else if(req.body.functionName == Get_Shopping_Cart_For_Account) {
      return res(
        ctx.status(200),
        ctx.json({
          body: {
            shoppingCart: {
              ref: {
                ['@ref']: {
                  id: "1"
                }
              },
              data: {
                account: {
                  ['@ref']: {
                    id: "123"
                  }
                },
                products: {}
              }
            }
          }
        })
      )
    }
  })
)

beforeAll(() => {
  jest.resetModules()
  server.listen()
})
beforeEach(() => {
  localStorage.clear();
});
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('User is logged in and trying to access restricted page and has proper role', async () => {
  useRouter.mockImplementation(() => {
    return {
        pathname: "/owner",
        query: {},
    }
  })
  localStorage.setItem('loggedIn', true)
  const { findByText } = render(<Authenticate Component={TestComponent}/>)

  // Display Component
  expect(await findByText('Hello Owner')).toBeInTheDocument()
});

test('User is not logged in and trying to access restircted page', async () => {
  useRouter.mockImplementation(() => {
    return {
        pathname: "/owner",
        query: {},
    }
  })
  const { findByText } = render(<Authenticate Component={TestComponent}/>)

  expect(await findByText('Please login to view this page')).toBeInTheDocument()
});

test('User is not logged in and trying to access non-restricted page', async () => {
  useRouter.mockImplementation(() => {
    return {
        pathname: "/",
        query: {},
    }
  })
  const { findByText } = render(<Authenticate Component={TestComponent}/>)

  // Display Component
  expect(await findByText('Hello Owner')).toBeInTheDocument()
});

test('Refresh Token throws an error I.E User Refresh Token has expired', async () => {
  localStorage.setItem('loggedIn', true)
  useRouter.mockImplementation(() => {
    return {
        pathname: "/owner",
        query: {},
    }
  })
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

test('User does not have role/permission to view page', async () => {
  useRouter.mockImplementation(() => {
    return {
        pathname: "/owner",
        query: {},
    }
  })
  localStorage.setItem('loggedIn', true)
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
  localStorage.setItem('loggedIn', true)
  useRouter.mockImplementation(() => {
    return {
        pathname: "/owner",
        query: {
          shopId: 123
        },
    }
  })
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
                  id: "123"
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
      if(req.body.functionName == Get_Shop) {
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
      }
    })
  )
  const { findByText } = render(<Authenticate Component={TestComponent}/>)

  expect(await findByText('You do not have permission to access to this page')).toBeInTheDocument()
});

