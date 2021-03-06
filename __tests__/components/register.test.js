import React from 'react';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { render, fireEvent, act } from 'test-utils';
import '@testing-library/jest-dom/extend-expect'
import { RegisterAccount } from '../../components'
const { FUNCTIONS: { Register, Create_Shopping_Cart }} = require('../../util/constants/database/functions')
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
  rest.post('http://localhost:3000/api/callFunction', (req, res, ctx) => {
    if(req.body.functionName == Register) {
      return res(
        ctx.status(200),
        ctx.cookie('refreshToken', 'abc-123'),
        ctx.json({
          body: {
            message: "Account Created",
            account: {
              data: {
                email: "test@test.com"
              }
            }
          }
        })
      )
    }
    else if(req.body.functionName == Create_Shopping_Cart) {
      return res(
        ctx.status(200),
        ctx.cookie('refreshToken', 'abc-123'),
        ctx.json({
          body: {
            shoppingCart: {
              data: {
                products: {},
                account: {
                  ['@ref']: {
                    ref: {
                      id: "123"
                    }
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

beforeAll(() => {
  server.listen()
  jest.resetModules()
  process.env = {
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000"
  };
})
beforeEach(() => {
  localStorage.clear();
});
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
 
test('Successfully Register new user', async () => {
  const { findByText } = render(<RegisterAccount />)

  // Register
  await act(async () => {
    fireEvent.click(await findByText('Sign Up'))
  })
  //expect(await findByText('Account Created')).toBeInTheDocument()
});

test('Invalid Register Succesfully displays toast', async () => {
  server.use(
    rest.post('http://localhost:3000/api/callFunction', (req, res, ctx) => {
      if(req.body.functionName == Register) {
        return res(
          ctx.status(400),
          ctx.cookie('refreshToken', 'abc-123'),
          ctx.json({
            message: "Account with this email already exists",
          })
        )
      }
    })
  )

  const { findByText } = render(<RegisterAccount />)

  // Register
  await act(async () => {
    fireEvent.click(await findByText('Sign Up'))
  })
  expect(await findByText('Account with this email already exists')).toBeInTheDocument()
});