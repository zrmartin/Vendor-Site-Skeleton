import React from 'react';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { render, fireEvent, act } from 'test-utils';
import '@testing-library/jest-dom/extend-expect'
import { LoginRegisterModal } from '../../components'
const { FUNCTIONS: { Register, Create_Shopping_Cart }} = require('../../util/constants/database/functions')
const { HTTP_CODES: { Success, Bad_Request }} = require ('../../util/constants/httpCodes')
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
            code: Success,
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
            code: Success,
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
 
test('Successfully display modal and Log user in, the hide modal', async () => {
  const setShow = jest.fn()
  const { findByText, findByTestId, rerender } = render(<LoginRegisterModal show={true} message={"Please Login to view this page"} setShow={setShow}/>)

  // Login
  expect(await findByText('Please Login to view this page')).toBeInTheDocument()
  await act(async () => {
    fireEvent.click(await findByTestId('login'))
  })

  rerender(<LoginRegisterModal show={false} message={"Please Login to view this page"} setShow={setShow}/>)
  expect(await findByTestId('modal')).not.toBeVisible()
});

test('Invalid Login Credentials Succesfully displays toast', async () => {
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

  const setShow = jest.fn((show) => {})
  const { findByTestId, findByText } = render(<LoginRegisterModal show={true} message={"Please Login to view this page"} setShow={setShow}/>)

  // Login
  expect(await findByText('Please Login to view this page')).toBeInTheDocument()
  fireEvent.click(await findByTestId('login'))
  expect(await findByText(errorMessage)).toBeInTheDocument()
});

test('Invalid Register Succesfully displays toast', async () => {
  server.use(
    rest.post('http://localhost:3000/api/callFunction', (req, res, ctx) => {
      if(req.body.functionName == Register) {
        return res(
          ctx.status(200),
          ctx.cookie('refreshToken', 'abc-123'),
          ctx.json({
            body: {
              code: Bad_Request,
              message: "Account with this email already exists",
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
              code: Success,
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

  const setShow = jest.fn((show) => {})
  const { findByTestId, findByText } = render(<LoginRegisterModal show={true} message={"Please Login to view this page"} setShow={setShow}/>)

  // Login
  expect(await findByText('Please Login to view this page')).toBeInTheDocument()
  fireEvent.click(await findByTestId('register'))
  expect(await findByText('Account with this email already exists')).toBeInTheDocument()
});
