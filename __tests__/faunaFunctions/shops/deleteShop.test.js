import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Delete_Shop, Create_Shop }} = require('../../../util/constants/database/functions')
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

test('Successfully deletes existing shop', async () => {
  const testShop = {
    name: "Test Shop"
  }
  const createShopResponse = await userClient.query(
    Call(Create_Shop, [testShop]
    )
  )

  const deleteShopResponse = await userClient.query(
    Call(Delete_Shop, [{
      id: createShopResponse.shop.ref.id,
    }])
  )

  expect(deleteShopResponse.code).toEqual(Success);
  expect(deleteShopResponse.message).toEqual("Shop Deleted")
  expect(deleteShopResponse.deletedShop.data).toMatchObject(testShop)
});

test('Successfully returns error message if shop does not exist', async () => {
  const deleteShopResponse = await userClient.query(
    Call(Delete_Shop, [{
      id: "-1"
    }]),
  )
  expect(deleteShopResponse.message).toEqual("Shop not found, could not delete")
  expect(deleteShopResponse.code).toEqual(Not_Found);
});

test('Successfully returns error message when trying to delete a shop that is not yours', async () => {
  const userClient2 = await createTestUserAndClient(adminClient, "test2@test.com", "password")

  const createShopResponse = await userClient.query(
    Call(Create_Shop, [{name: "Test Shop"}]
    )
  )
  
  const deleteShopResponse = await userClient2.query(
    Call(Delete_Shop, [{
      id: createShopResponse.shop.ref.id
    }]),
  )

  expect(deleteShopResponse.message).toEqual("Shop not found, could not delete")
  expect(deleteShopResponse.code).toEqual(Not_Found);
});