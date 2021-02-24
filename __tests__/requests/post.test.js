
import { enableFetchMocks } from 'jest-fetch-mock'
enableFetchMocks()
import { POST } from '../../util/requests'
const { HTTP_CODES: { Unauthenticated }} = require('../../util/constants/httpCodes')

beforeAll(() => {
  fetch.resetMocks()
})

test('Post returns body on success', async () => {
  const response = {
    body: {
      field1: "test1",
      field2: "test2"
    }
  }
  fetchMock.mockOnce(JSON.stringify(response))

  const results = await POST("someEndpoint")

  expect(results).toEqual(response.body)
});

test('Post throws error if status code is not ok', async () => {
  const response = {
    message: "Error Message",
    status: Unauthenticated
  }
  fetchMock.mockOnce(JSON.stringify(response), {status: Unauthenticated})

  try {
    await POST("someEndpoint")
  }
  catch (e) {
    expect(e.message).toEqual(response.message)
    expect(e.status).toEqual(response.status)
  }
});