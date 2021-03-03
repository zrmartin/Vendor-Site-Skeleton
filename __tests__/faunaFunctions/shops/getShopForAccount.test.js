import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUser, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Get_Shop_For_Account }} = require('../../../util/constants/database/functions')
const { INDEXES: { Shop_For_Account }} = require('../../../util/constants/database/indexes')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
const { ROLES: { owner }} = require('../../../util/constants/roles')
const { COLLECTIONS: { Shops }} = require('../../../util/constants/database/collections')
const { Call, Create, Collection, CurrentIdentity, Delete, Index, Ref } = query
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

test('Successfully gets existing shop', async () => {
  const getShopForAccountResponse = await userClient.query(
    Call(Get_Shop_For_Account, [])
  )

  expect(getShopForAccountResponse.code).toEqual(Success);
  expect(getShopForAccountResponse.shop.data).toMatchObject(testShop.data)
});

test('Successfully returns empty object if user has not created a store', async () => {
  await userClient.query(
    Delete(Ref(Collection(Shops), testShop.ref.id))
  )
  const getShopForAccountResponse = await userClient.query(
    Call(Get_Shop_For_Account, [])
  )

  expect(getShopForAccountResponse.code).toEqual(Success);
  expect(getShopForAccountResponse.shop).toEqual({})
});

test('Successfully returns error message is Shop_For_Account index does not exist', async () => {
  await adminClient.query(
    Delete(Index(Shop_For_Account))
  )
  const getAllShopsReponse = await userClient.query(
    Call(Get_Shop_For_Account, []),
  )
  expect(getAllShopsReponse.message).toEqual("Could not find Shop_For_Account Index")
  expect(getAllShopsReponse.code).toEqual(Not_Found);
});