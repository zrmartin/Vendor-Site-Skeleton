
import { enableFetchMocks } from 'jest-fetch-mock'
enableFetchMocks()
import { GET } from '../../util/requests'
const { HTTP_CODES: { Unauthenticated }} = require('../../util/constants/httpCodes')

beforeAll(() => {
  fetch.resetMocks()
})

test('GET returns body on success', async () => {
  const response = {
    body: {
      field1: "test1",
      field2: "test2"
    }
  }
  fetchMock.mockOnce(JSON.stringify(response))

  const results = await GET("someEndpoint")

  expect(results).toEqual(response.body)
});

test('GET throws error if status code is not ok', async () => {
  const response = {
    message: "Error Message",
    status: Unauthenticated
  }
  fetchMock.mockOnce(JSON.stringify(response), {status: Unauthenticated})

  try {
    await GET("someEndpoint")
  }
  catch (e) {
    expect(e.message).toEqual(response.message)
    expect(e.status).toEqual(response.status)
  }
});