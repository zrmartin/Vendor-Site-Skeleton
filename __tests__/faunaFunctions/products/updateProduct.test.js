import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUser, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Update_Product }} = require('../../../util/constants/database/functions')
const { COLLECTIONS: { Products, Shops}} = require('../../../util/constants/database/collections')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
const { ROLES: { owner }} = require('../../../util/constants/roles')
const { Call, Create, Collection, CurrentIdentity, Ref } = query
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

test('Successfully updates existing product', async () => {
  const updatedProduct = {
    name: "Updated Product",
    price: 12345,
    quantity: 50
  }

  const response = await userClient.query(
    Call(Update_Product, [{
      id: testProduct.ref.id,
      ...updatedProduct
    }])
  )

  expect(response.code).toEqual(Success);
  expect(response.message).toEqual("Product Updated")
  expect(response.updatedProduct.data).toMatchObject(updatedProduct)
});

test('Successfully returns error message if product does not exist', async () => {
  const response = await userClient.query(
    Call(Update_Product, [{
      id: "-1"
    }]),
  )
  expect(response.message).toEqual("Product not found, could not update")
  expect(response.code).toEqual(Not_Found);
});

test('Successfully throws and error when trying to update a product that is not yours', async () => {
  const userData2 = await createTestUser(adminClient, "test2@test.com", "password", [owner])
  const userClient2 = new Client({
    secret: userData2.access.secret
  })
  let updateProductRepsonse

  try {
    updateProductRepsonse = await userClient2.query(
      Call(Update_Product, [{
        id: testProduct.ref.id,
        name: "Updated Product Name"
      }]),
    )
  }
  catch(e) {
    updateProductRepsonse = e
  }

  expect(updateProductRepsonse.requestResult.responseContent.errors).not.toBeNull();
  expect(updateProductRepsonse.requestResult.statusCode).not.toBeNull();
});