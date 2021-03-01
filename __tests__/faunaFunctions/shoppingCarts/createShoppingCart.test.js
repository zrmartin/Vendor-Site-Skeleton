import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Create_Shopping_Cart }} = require('../../../util/constants/database/functions')
const { HTTP_CODES: { Success }} = require('../../../util/constants/httpCodes')
const { Call } = query
let adminClient
let userClient
let databaseInfo

beforeEach(async () => {
  databaseInfo = await createChildDatabase()
  adminClient = new Client({
    secret: databaseInfo.key.secret
  })
  await setupDatabase(adminClient)
  userClient = await createTestUserAndClient(adminClient, "test@test.com", "password", [])
})
afterEach(async () => {
  await destroyDatabase(databaseInfo)
})

test('Successfully create new Shopping Cart', async () => {
  const createShoppingCartResponse = await userClient.query(
    Call(Create_Shopping_Cart, [])
  )

  expect(createShoppingCartResponse.code).toEqual(Success);
});

test('Successfully throws error if user trys to create more than one shopping cart', async () => {
  const createShoppingCartOneResponse = await userClient.query(
    Call(Create_Shopping_Cart, [])
  )
  let createShoppingCartTwoResponse
  try {
    createShoppingCartTwoResponse = await userClient.query(
      Call(Create_Shopping_Cart, [])
    )
  }
  catch(e) {
    createShoppingCartTwoResponse = e
  }

  expect(createShoppingCartTwoResponse.requestResult.responseContent.errors).not.toBeNull();
  expect(createShoppingCartTwoResponse.requestResult.statusCode).not.toBeNull();
});