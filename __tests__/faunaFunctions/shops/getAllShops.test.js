import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Get_All_Shops, Create_Shop }} = require('../../../util/constants/database/functions')
const { INDEXES: { All_Shops }} = require('../../../util/constants/database/indexes')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
const { Call, Delete, Index } = query
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

test('Successfully gets all shops for given account', async () => {
  const userClient2 = await createTestUserAndClient(adminClient, "test2@test.com", "password")

  // Create a second shop under a different account
  const shopData = {
    name: "Test Shop"
  }
  await userClient2.query(
    Call(Create_Shop, [shopData])
  )

  const getAllShopsReponse = await userClient.query(
    Call(Get_All_Shops, [])
  )

  expect(getAllShopsReponse.shops.length).toEqual(1)
  expect(getAllShopsReponse.code).toEqual(Success);
  expect(getAllShopsReponse.shops[0].data).toMatchObject(testShop.data)
});

test('Successfully returns error message is All_shops index does not exist', async () => {
  await adminClient.query(
    Delete(Index(All_Shops))
  )
  const getAllShopsReponse = await userClient.query(
    Call(Get_All_Shops, []),
  )
  expect(getAllShopsReponse.message).toEqual("Could not find All_Shops Index")
  expect(getAllShopsReponse.code).toEqual(Not_Found);
});