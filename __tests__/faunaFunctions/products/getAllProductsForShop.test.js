import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUser, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Get_All_Products_For_Shop }} = require('../../../util/constants/database/functions')
const { COLLECTIONS: { Products, Shops }} = require('../../../util/constants/database/collections')
const { INDEXES: { All_Products_For_Shop }} = require('../../../util/constants/database/indexes')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
const { ROLES: { owner }} = require('../../../util/constants/roles')
const { Call, Delete, Index, Collection, Create, CurrentIdentity, Ref } = query
let adminClient
let userClient
let userData
let databaseInfo
let testProduct

async function setupTestEntities() {
  testProduct = await userClient.query(
    Create(Collection(Products), {
      data: {
        account: CurrentIdentity(),
        shop: Ref(Collection(Shops), "123"),
        name: "Test Product",
        price: 100,
        quantity: 1
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

test('Successfully gets all products for a given shop', async () => {
  const userData2 = await createTestUser(adminClient, "test2@test.com", "password", [owner])
  const userClient2 = new Client({
    secret: userData2.access.secret
  })
  // Create a second product under a different account
  const testProduct2 = await userClient2.query(
    Create(Collection(Products), {
      data: {
        account: CurrentIdentity(),
        shop: Ref(Collection(Shops), "456"),
        name: "Test Product",
        price: 100,
        quantity: 1
      }
    })
  )

  const response = await userClient.query(
    Call(Get_All_Products_For_Shop, [{
      shopId: "123"
    }])
  )
  const productData = response.products.map(product => product.data)

  expect(response.products.length).toEqual(1)
  expect(response.code).toEqual(Success);
  expect(productData).toContainEqual(testProduct.data)
});

test('Successfully returns error message is All_Products_For_Shop index does not exist', async () => {
  await adminClient.query(
    Delete(Index(All_Products_For_Shop))
  )
  const response = await userClient.query(
    Call(Get_All_Products_For_Shop, [{
      shopId: '123'
    }]),
  )
  expect(response.message).toEqual("Could not find All_Products_For_Shop Index")
  expect(response.code).toEqual(Not_Found);
});