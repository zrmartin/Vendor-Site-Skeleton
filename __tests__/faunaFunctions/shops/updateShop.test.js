import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Update_Shop, Create_Shop }} = require('../../../util/constants/database/functions')
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

test('Successfully updates existing shop', async () => {
  const originalShop = {
    name: "Test Shop"
  }
  const createShopResponse = await userClient.query(
    Call(Create_Shop, [originalShop])
  )

  const UpdatedShop = {
    name: "Updated Shop Name",
  }

  const updateShopReponse = await userClient.query(
    Call(Update_Shop, [{
      id: createShopResponse.shop.ref.id,
      ...UpdatedShop
    }])
  )

  expect(updateShopReponse.code).toEqual(Success);
  expect(updateShopReponse.message).toEqual("Shop Updated")
  expect(updateShopReponse.updatedShop.data).toMatchObject(UpdatedShop)
});

test('Successfully returns error message if shop does not exist', async () => {
  const response = await userClient.query(
    Call(Update_Shop, [{
      id: "-1"
    }]),
  )
  expect(response.message).toEqual("Shop not found, could not update")
  expect(response.code).toEqual(Not_Found);
});

test('Successfully returns error message when trying to update a shop that is not yours', async () => {
  const userClient2 = await createTestUserAndClient(adminClient, "test2@test.com", "password")

  const createShopResponse = await userClient.query(
    Call(Create_Shop, [{name: "Test Shop"}]
    )
  )

  const updateShopRepsonse = await userClient2.query(
    Call(Update_Shop, [{
      id: createShopResponse.shop.ref.id,
      name: "Updated Shop Name"
    }]),
  )

  expect(updateShopRepsonse.message).toEqual("Shop not found, could not update")
  expect(updateShopRepsonse.code).toEqual(Not_Found);
});