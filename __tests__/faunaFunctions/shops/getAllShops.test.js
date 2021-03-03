import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUser, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Get_All_Shops }} = require('../../../util/constants/database/functions')
const { INDEXES: { All_Shops }} = require('../../../util/constants/database/indexes')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
const { ROLES: { owner }} = require('../../../util/constants/roles')
const { COLLECTIONS: { Shops }} = require('../../../util/constants/database/collections')
const { Call, Delete, Index, Create, Collection, CurrentIdentity } = query
let adminClient
let userClient
let userData
let databaseInfo
let testShop

async function setupTestEntities() {
  testShop = await userClient.query(
    Create(Collection(Shops), {
      data: {
        account: CurrentIdentity(),
        name: "Test Shop"
      }
    })
  )
}

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
  await setupTestEntities()
})

afterEach(async () => {
  await destroyDatabase(databaseInfo)
})

test('Successfully gets all shops for for all accounts', async () => {
  const userData2 = await createTestUser(adminClient, "test2@test.com", "password", [owner])
  const userClient2 = new Client({
    secret: userData2.access.secret
  })

  // Create a second shop under a different account
  const testShop2 = await userClient2.query(
    Create(Collection(Shops), {
      data: {
        account: CurrentIdentity(),
        name: "Test Shop"
      }
    })
  )

  const getAllShopsReponse = await userClient.query(
    Call(Get_All_Shops, [])
  )
  const returnedShopData = getAllShopsReponse.shops.map(shop => shop.data)

  expect(getAllShopsReponse.shops.length).toEqual(2)
  expect(getAllShopsReponse.code).toEqual(Success);
  expect(returnedShopData).toContainEqual(testShop.data)
  expect(returnedShopData).toContainEqual(testShop2.data)
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