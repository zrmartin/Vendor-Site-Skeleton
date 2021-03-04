import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUser, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Create_Shop }} = require('../../../util/constants/database/functions')
const { HTTP_CODES: { Success, Validation_Error}} = require('../../../util/constants/httpCodes')
const { ROLES: { owner }} = require('../../../util/constants/roles')
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
  userData = await createTestUser(adminClient, "test@test.com", "password", [owner])
  userClient = new Client({
    secret: userData.access.secret
  })
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

test('Successfully returns error message if user trys to create more than one shop', async () => {
  const testShop = {
    name: "Test Shop",
  }

  const createShopOneResponse = await userClient.query(
    Call(Create_Shop, [testShop])
  )
  const createShopTwoResponse = await userClient.query(
    Call(Create_Shop, [testShop])
  )

  expect(createShopTwoResponse.code).toEqual(Validation_Error);
  expect(createShopTwoResponse.message).toEqual("You cannot create more than 1 Shop")
});