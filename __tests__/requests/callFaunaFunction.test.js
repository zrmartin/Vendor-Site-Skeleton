
import { enableFetchMocks } from 'jest-fetch-mock'
enableFetchMocks()
import { CALL_FAUNA_FUNCTION } from '../../util/requests'
const { HTTP_CODES: { Unauthenticated }} = require('../../util/constants/httpCodes')

beforeAll(() => {
  fetch.resetMocks()
})

test('CALL_FAUNA_FUNCTION returns body on success', async () => {
  const response = {
    body: {
      field1: "test1",
      field2: "test2"
    }
  }
  fetchMock.mockOnce(JSON.stringify(response))

  const results = await CALL_FAUNA_FUNCTION("functionName", "accessToken", null, {})

  expect(results).toEqual(response.body)
});

test('CALL_FAUNA_FUNCTION throws error if status code is not ok', async () => {
  const response = {
    message: "Error Message",
    status: Unauthenticated
  }
  fetchMock.mockOnce(JSON.stringify(response), {status: Unauthenticated})

  try {
    const results = await CALL_FAUNA_FUNCTION("functionName", "accessToken", null, {})
  }
  catch (e) {
    expect(e.message).toEqual(response.message)
    expect(e.status).toEqual(response.status)
  }
});