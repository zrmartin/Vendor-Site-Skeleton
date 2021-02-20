import { handleFaunaResults } from '../../util/helpers'
const { HTTP_CODES: { Success, Unauthenticated }} = require('../../util/constants/httpCodes')
import { toast } from 'react-toastify'

test('handleFaunaResults calls toast, mutate, and router.push on Success and messgae supplied', () => {
  const mockedMutate = jest.fn(() => {})
  const mockedRouter = {
    push: jest.fn(() => {})
  }
  const toastErrorSpy = jest.spyOn(toast, 'error')
  const toastSuccessSpy = jest.spyOn(toast, 'success')
  const results =  {
    code: Success,
    message: "test Message"
  }
  handleFaunaResults(results, mockedMutate, "/index", mockedRouter)

  expect(toastSuccessSpy).toHaveBeenCalled
  expect(toastErrorSpy).not.toHaveBeenCalled
  expect(mockedMutate).toHaveBeenCalled
  expect(mockedRouter.push).toHaveBeenCalled
});

test('handleFaunaResults calls toast error, on Not Success', () => {
  const toastSuccessSpy = jest.spyOn(toast, 'success')
  const toastErrorSpy = jest.spyOn(toast, 'error')
  const results =  {
    code: Unauthenticated,
    message: "test Message"
  }
  handleFaunaResults(results)

  expect(toastSuccessSpy).not.toHaveBeenCalled
  expect(toastErrorSpy).toHaveBeenCalled
});