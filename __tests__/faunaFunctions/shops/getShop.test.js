import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Get_Shop, Create_Shop }} = require('../../../util/constants/database/functions')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
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
  userClient = await createTestUserAndClient(adminClient, "test@test.com", "password")
})

afterEach(async () => {
  await destroyDatabase(databaseInfo)
})


test('Successfully gets existing shop', async () => {
  const testShop = {
    name: "Test Shop"
  }

  const createShopRepsonse = await userClient.query(
    Call(Create_Shop, [testShop]
    )
  )

  const getShopResponse = await userClient.query(
    Call(Get_Shop, [{
      id: createShopRepsonse.shop.ref.id
    }])
  )

  expect(getShopResponse.code).toEqual(Success);
  expect(getShopResponse.shop.data).toMatchObject(testShop)
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

  const createShopResponse = await userClient.query(
    Call(Create_Shop, [{name: "Test Shop"}]
    )
  )

  const getShopResponse = await userClient2.query(
    Call(Get_Shop, [{
      id: createShopResponse.shop.ref.id
    }]),
  )

  expect(getShopResponse.message).toEqual("Shop not found")
  expect(getShopResponse.code).toEqual(Not_Found);
});