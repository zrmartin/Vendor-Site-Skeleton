import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Get_Shop, Create_Shop }} = require('../../../util/constants/database/functions')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
const { Call } = query
let adminClient
let userClient
let databaseInfo
let testShop

async function setupTestShop() {
  return await userClient.query(
    Call(Create_Shop, [{
        name: "Test Shop",
    }])
  )
}

beforeEach(async () => {
  databaseInfo = await createChildDatabase()
  adminClient = new Client({
    secret: databaseInfo.key.secret
  })
  await setupDatabase(adminClient)
  userClient = await createTestUserAndClient(adminClient, "test@test.com", "password")
  testShop = (await setupTestShop()).shop
})

afterEach(async () => {
  await destroyDatabase(databaseInfo)
})

test('Successfully gets existing shop', async () => {
  const getShopResponse = await userClient.query(
    Call(Get_Shop, [{
      id: testShop.ref.id
    }])
  )

  expect(getShopResponse.code).toEqual(Success);
  expect(getShopResponse.shop.data).toMatchObject(testShop.data)
});

test('Successfully returns error message if shop does not exist', async () => {
  const response = await userClient.query(
    Call(Get_Shop, [{
      id: "-1"
    }]),
  )
  expect(response.message).toEqual("Shop not found")
  expect(response.code).toEqual(Not_Found);
});

test('Successfully returns error message when trying to get a shop that is not yours', async () => {
  const userClient2 = await createTestUserAndClient(adminClient, "test2@test.com", "password")

  const getShopResponse = await userClient2.query(
    Call(Get_Shop, [{
      id: testShop.ref.id
    }]),
  )

  expect(getShopResponse.message).toEqual("Shop not found")
  expect(getShopResponse.code).toEqual(Not_Found);
});