import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Get_All_Products_For_Account, Create_Product }} = require('../../../util/constants/database/functions')
const { INDEXES: { All_Products_For_Account }} = require('../../../util/constants/database/indexes')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
const { ROLES: { owner }} = require('../../../util/constants/roles')
const { Call, Delete, Index } = query
let adminClient
let userClient
let databaseInfo
let testProduct


async function setupTestProduct() {
  return await userClient.query(
    Call(Create_Product, [{
        name: "Test Product",
        price: 100,
        quantity: 1
    }])
  )
}

beforeEach(async () => {
  databaseInfo = await createChildDatabase()
  adminClient = new Client({
    secret: databaseInfo.key.secret
  })
  await setupDatabase(adminClient)
  userClient = await createTestUserAndClient(adminClient, "test@test.com", "password", [owner])
  testProduct = (await setupTestProduct()).product
})

afterEach(async () => {
  await destroyDatabase(databaseInfo)
})

test('Successfully gets all products for a given account', async () => {
  const userClient2 = await createTestUserAndClient(adminClient, "test2@test.com", "password", [owner])
  // Create a second product under a different account
  await userClient2.query(
    Call(Create_Product, [{
      name: "Test Product 2",
      price: 100,
      quantity: 1
    }])
  )

  const response = await userClient.query(
    Call(Get_All_Products_For_Account, [])
  )
  const productData = response.products.map(product => product.data)

  expect(response.products.length).toEqual(1)
  expect(response.code).toEqual(Success);
  expect(productData).toContainEqual(testProduct.data)
});

test('Successfully returns error message is All_Products_For_Account index does not exist', async () => {
  await adminClient.query(
    Delete(Index(All_Products_For_Account))
  )
  const response = await userClient.query(
    Call(Get_All_Products_For_Account, []),
  )
  expect(response.message).toEqual("Could not find All_Products_For_Account Index")
  expect(response.code).toEqual(Not_Found);
});