import { handleFaunaResults } from '../../util/helpers'
import toast from 'react-hot-toast';

beforeAll(() => {
  jest.resetModules()
})
beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  jest.clearAllMocks();
});

test('handleFaunaResults calls mutate, toastSuccess, redirectUrl, and router.push on Success and message', () => {
  const mockedResults = {
    message: "Success"
  }
  const toastSuccessSpy = jest.spyOn(toast, 'success')
  const toastDismissSpy = jest.spyOn(toast, 'dismiss')
  const toastId = toast.loading("Loading")
  const mockedMutate = jest.fn(() => {})
  const mockedRouter = {
    push: jest.fn(() => {})
  }

  handleFaunaResults({
    results: mockedResults,
    mutate: mockedMutate,
    redirectUrl: "mockedRedirectUrl",
    router: mockedRouter,
    toastId
  })
  expect(toastSuccessSpy).toHaveBeenCalled()
  expect(toastDismissSpy).not.toHaveBeenCalled()
  expect(mockedMutate).toHaveBeenCalled()
  expect(mockedRouter.push).toHaveBeenCalled()
});

test('handleFaunaResults does not call mutate, router.push, or toast.success if not supplied and no message', () => {
  const mockedResults = {
  }
  const mockedMutate = jest.fn(() => {})
  const mockedRouter = {
    push: jest.fn(() => {})
  }
  const toastSuccessSpy = jest.spyOn(toast, 'success')
  const toastDismissSpy = jest.spyOn(toast, 'dismiss')
  const toastId = toast.loading("Loading")

  handleFaunaResults({
    results: mockedResults,
    router: mockedRouter,
    toastId
  })

  expect(toastSuccessSpy).not.toHaveBeenCalled()
  expect(toastDismissSpy).toHaveBeenCalled()
  expect(mockedMutate).not.toHaveBeenCalled()
  expect(mockedRouter.push).not.toHaveBeenCalled()
});


