import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Get_All_Products, Create_Product, Create_Shop }} = require('../../../util/constants/database/functions')
const { INDEXES: { All_Products }} = require('../../../util/constants/database/indexes')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
const { ROLES: { owner }} = require('../../../util/constants/roles')
const { Call, Delete, Index, Let, Var, Select } = query
let adminClient
let userClient
let databaseInfo
let testProduct

async function setupTestEntities() {
  testProduct = (await userClient.query(
    Call(Create_Product, [
      {
        shopId: "123",
        name: "Test Product",
        price: 100,
        quantity: 1
      }
    ])
  )).product
}

beforeEach(async () => {
  databaseInfo = await createChildDatabase()
  adminClient = new Client({
    secret: databaseInfo.key.secret
  })
  await setupDatabase(adminClient)
  userClient = await createTestUserAndClient(adminClient, "test@test.com", "password", [owner])
  await setupTestEntities()
})

afterEach(async () => {
  await destroyDatabase(databaseInfo)
})

test('Successfully gets all products created by all accounts', async () => {
  const userClient2 = await createTestUserAndClient(adminClient, "test2@test.com", "password", [owner])
  // Create a second product under a different account
  const testProduct2 = (await userClient2.query(
    Call(Create_Product, [{
      shopId: "123",
      name: "Test Product 2",
      price: 100,
      quantity: 1
    }])
  )).product

  const response = await userClient.query(
    Call(Get_All_Products, [])
  )

  const productData = response.products.map(product => product.data)
  expect(response.products.length).toEqual(2)
  expect(response.code).toEqual(Success);
  expect(productData).toContainEqual(testProduct.data)
  expect(productData).toContainEqual(testProduct2.data)
});

test('Successfully returns error message is All_Products index does not exist', async () => {
  await adminClient.query(
    Delete(Index(All_Products))
  )
  const response = await userClient.query(
    Call(Get_All_Products, []),
  )
  expect(response.message).toEqual("Could not find All_Products Index")
  expect(response.code).toEqual(Not_Found);
});