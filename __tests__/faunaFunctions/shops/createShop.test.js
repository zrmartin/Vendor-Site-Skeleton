import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Create_Shop }} = require('../../../util/constants/database/functions')
const { HTTP_CODES: { Success }} = require('../../../util/constants/httpCodes')
const { ROLES: { owner }} = require('../../../util/constants/roles')
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
  userClient = await createTestUserAndClient(adminClient, "test@test.com", "password", [owner])
})
afterEach(async () => {
  await destroyDatabase(databaseInfo)
})

test('Successfully create new shop', async () => {
  const testShop = {
    name: "Test Shop",
  }

  const createShopResponse = await userClient.query(
    Call(Create_Shop, [testShop])
  )

  expect(createShopResponse.shop.data).toMatchObject(testShop)
  expect(createShopResponse.code).toEqual(Success);
  expect(createShopResponse.message).toEqual("Shop Created")
});

test('Successfully throws error if user trys to create more than one shop', async () => {
  const testShop = {
    name: "Test Shop",
  }

  const createShopOneResponse = await userClient.query(
    Call(Create_Shop, [testShop])
  )
  let createShopTwoResponse
  try {
    createShopTwoResponse = await userClient.query(
      Call(Create_Shop, [testShop])
    )
  }
  catch(e) {
    createShopTwoResponse = e
  }

  expect(createShopTwoResponse.requestResult.responseContent.errors).not.toBeNull();
  expect(createShopTwoResponse.requestResult.statusCode).not.toBeNull();
});