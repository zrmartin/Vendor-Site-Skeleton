import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUser, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Create_Shopping_Cart }} = require('../../../util/constants/database/functions')
const { HTTP_CODES: { Success }} = require('../../../util/constants/httpCodes')
const { Call } = query
let adminClient
let userClient
let userData
let databaseInfo

beforeEach(async () => {
  databaseInfo = await createChildDatabase()
  adminClient = new Client({
    secret: databaseInfo.key.secret
  })
  await setupDatabase(adminClient)
  userData = await createTestUser(adminClient, "test@test.com", "password", [])
  userClient = new Client({
    secret: userData.access.secret
  })
})
afterEach(async () => {
  await destroyDatabase(databaseInfo)
})

test('Successfully create new Shopping Cart', async () => {
  const createShoppingCartResponse = await userClient.query(
    Call(Create_Shopping_Cart, [{
      accountId: userData.account.ref.id
    }])
  )

  expect(createShoppingCartResponse.code).toEqual(Success);
});

test('Successfully throws error if user trys to create more than one shopping cart', async () => {
  const createShoppingCartOneResponse = await userClient.query(
    Call(Create_Shopping_Cart, [{
      accountId: userData.account.ref.id
    }])
  )
  let createShoppingCartTwoResponse
  try {
    createShoppingCartTwoResponse = await userClient.query(
      Call(Create_Shopping_Cart, [{
        accountId: userData.account.ref.id
      }])
    )
  }
  catch(e) {
    createShoppingCartTwoResponse = e
  }

  expect(createShoppingCartTwoResponse.requestResult.responseContent.errors).not.toBeNull();
  expect(createShoppingCartTwoResponse.requestResult.statusCode).not.toBeNull();
});