import { handleFaunaError } from '../../util/helpers'
const { HTTP_CODES: { Success, Unauthenticated }} = require('../../util/constants/httpCodes')
import { toast } from 'react-toastify'

test('handleFaunaError updates accountContext on Unauthentictaed and logged in', () => {
  localStorage.setItem('loggedIn', true)
  const mockedAccountContext = {
    setBusy: jest.fn(() => {}),
    setAccessToken: jest.fn(() => {}),
    setAccount: jest.fn(() => {})
  }
  const toastErrorSpy = jest.spyOn(toast, 'error')
  const error =  {
    code: Unauthenticated,
    message: "test Message"
  }
  handleFaunaError(mockedAccountContext, error)

  expect(toastErrorSpy).not.toHaveBeenCalled
  expect(mockedAccountContext.setBusy).toHaveBeenCalled
  expect(mockedAccountContext.setAccessToken).toHaveBeenCalled
  expect(mockedAccountContext.setAccount).toHaveBeenCalled
});

test('handleFaunaError calls toast error on Unauthenticated and not logged in', () => {
  const mockedAccountContext = {
    setBusy: jest.fn(() => {}),
    setAccessToken: jest.fn(() => {}),
    setAccount: jest.fn(() => {})
  }
  const toastErrorSpy = jest.spyOn(toast, 'error')
  const error =  {
    code: Unauthenticated,
    message: "test Message"
  }
  handleFaunaError(mockedAccountContext, error)

  expect(toastErrorSpy).not.toHaveBeenCalled
  expect(mockedAccountContext.setBusy).not.toHaveBeenCalled
  expect(mockedAccountContext.setAccessToken).not.toHaveBeenCalled
  expect(mockedAccountContext.setAccount).not.toHaveBeenCalled
});

test('handleFaunaError calls toast error, on Not Unauthenticated', () => {
  const mockedAccountContext = {
    setBusy: jest.fn(() => {}),
    setAccessToken: jest.fn(() => {}),
    setAccount: jest.fn(() => {})
  }
  const toastErrorSpy = jest.spyOn(toast, 'error')
  const error =  {
    code: Success,
    message: "test Message"
  }
  handleFaunaError(mockedAccountContext, error)

  expect(toastErrorSpy).not.toHaveBeenCalled
  expect(mockedAccountContext.setBusy).not.toHaveBeenCalled
  expect(mockedAccountContext.setAccessToken).not.toHaveBeenCalled
  expect(mockedAccountContext.setAccount).not.toHaveBeenCalled
});