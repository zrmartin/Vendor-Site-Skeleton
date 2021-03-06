import { handleFaunaResults } from '../../util/helpers'
const { HTTP_CODES: { Success, Unauthenticated }} = require('../../util/constants/httpCodes')

beforeEach(() => {
  localStorage.clear();
});

test('handleFaunaResults calls mutate, redirectUrl, and router.push on Success', () => {
  const mockedSuccessPromise = new Promise((resolve) => {
    resolve({
      data:{
        message: "Success"
      }
    })
  })
  const mockedSetShowLoginModal = jest.fn(() => {})
  const mockedRedirectUrl = jest.fn(() => {})
  const mockedUrlParams = {
    testId: "123"
  }
  const mockedMutate = jest.fn(() => {})
  const mockedRouter = {
    push: jest.fn(() => {})
  }

  handleFaunaResults({
    promise: mockedSuccessPromise,
    setShowLoginModal: mockedSetShowLoginModal,
    mutate: mockedMutate,
    redirectUrl: mockedRedirectUrl,
    urlParams: mockedUrlParams,
    router: mockedRouter,
  })

  expect(mockedMutate).toHaveBeenCalled
  expect(mockedRedirectUrl).toHaveBeenCalled
  expect(mockedRouter.push).toHaveBeenCalled
});

test('handleFaunaResults does not call redirectUrl function and router.push on Success', () => {
  const mockedSuccessPromise = new Promise((resolve) => {
    resolve({
      data:{
        message: "Success"
      }
    })
  })
  const mockedSetShowLoginModal = jest.fn(() => {})
  const mockedRedirectUrl = jest.fn(() => {})
  const mockedUrlParams = {
    testId: "123"
  }
  const mockedMutate = jest.fn(() => {})
  const mockedRouter = {
    push: jest.fn(() => {})
  }

  handleFaunaResults({
    promise: mockedSuccessPromise,
    setShowLoginModal: mockedSetShowLoginModal,
    mutate: mockedMutate,
    redirectUrl: mockedRedirectUrl,
    urlParams: mockedUrlParams,
    router: mockedRouter,
  })

  expect(mockedMutate).toHaveBeenCalled
  expect(mockedRedirectUrl).toHaveBeenCalled
  expect(mockedRouter.push).toHaveBeenCalled
});

test('handleFaunaResults sets account context to null when user is logged in and unauthenticated error is thrown', () => {
  localStorage.setItem('loggedIn', true)
  const mockedSuccessPromise = new Promise((reject) => {
    reject({
      status: Unauthenticated
    })
  })
  const mockedAccountContext = {
    setBusy: jest.fn(() => {}),
    setAccessToken: jest.fn(() => {}),
    setAccount: jest.fn(() => {}),
    setShopOwnerAccountId: jest.fn(() => {}),
    setShoppingCartId: jest.fn(() => {})
  }

  handleFaunaResults({
    promise: mockedSuccessPromise,
    accountContext: mockedAccountContext,
  })

  expect(mockedAccountContext.setBusy).toHaveBeenCalled
  expect(mockedAccountContext.setAccessToken).toHaveBeenCalled
  expect(mockedAccountContext.setAccount).toHaveBeenCalled
  expect(mockedAccountContext.setShoppingCartId).toHaveBeenCalled
  expect(mockedAccountContext.setShopOwnerAccountId).toHaveBeenCalled
});

test('handleFaunaResults display login modal when user is not logged in and unauthenticated error is thrown', () => {
  const mockedSuccessPromise = new Promise((reject) => {
    reject({
      status: Unauthenticated
    })
  })
  const mockedSetShowLoginModal = jest.fn(() => {})


  handleFaunaResults({
    promise: mockedSuccessPromise,
    setShowLoginModal: mockedSetShowLoginModal
  })

  expect(mockedSetShowLoginModal).toHaveBeenCalled
});

