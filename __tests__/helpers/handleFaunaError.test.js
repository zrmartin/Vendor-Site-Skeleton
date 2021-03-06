import { handleFaunaError } from '../../util/helpers'
const { HTTP_CODES: { Success, Unauthenticated }} = require('../../util/constants/httpCodes')
import toast from 'react-hot-toast';

beforeAll(() => {
  jest.resetModules()
})
beforeEach(() => {
  localStorage.clear();
});

test('handleFaunaError updates accountContext on Unauthentictaed and logged in', () => {
  localStorage.setItem('loggedIn', true)
  const toastErrorSpy = jest.spyOn(toast, 'error')
  const toastDismissSpy = jest.spyOn(toast, 'dismiss')
  const toastId = toast.loading("Loading")
  const mockedAccountContext = {
    setBusy: jest.fn(() => {}),
    setAccessToken: jest.fn(() => {}),
    setAccount: jest.fn(() => {})
  }

  const error =  {
    code: Unauthenticated,
    message: "test Message"
  }
  handleFaunaError(mockedAccountContext, error, toastId)

  expect(toastErrorSpy).not.toHaveBeenCalled
  expect(toastDismissSpy).not.toHaveBeenCalled
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
  const toastDismissSpy = jest.spyOn(toast, 'dismiss')
  const toastId = toast.loading("Loading")

  const error =  {
    code: Unauthenticated,
    message: "test Message"
  }
  handleFaunaError(mockedAccountContext, error, toastId)

  expect(toastErrorSpy).toHaveBeenCalled
  expect(toastDismissSpy).not.toHaveBeenCalled
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
  const toastDismissSpy = jest.spyOn(toast, 'dismiss')
  const toastId = toast.loading("Loading")

  const error =  {
    code: Success,
    message: "test Message"
  }
  handleFaunaError(mockedAccountContext, error, toastId)

  expect(toastErrorSpy).not.toHaveBeenCalled
  expect(toastDismissSpy).toHaveBeenCalled
  expect(mockedAccountContext.setBusy).not.toHaveBeenCalled
  expect(mockedAccountContext.setAccessToken).not.toHaveBeenCalled
  expect(mockedAccountContext.setAccount).not.toHaveBeenCalled
});