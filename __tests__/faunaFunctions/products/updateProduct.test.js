import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Update_Product, Create_Product }} = require('../../../util/constants/database/functions')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
const { Call } = query
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
  userClient = await createTestUserAndClient(adminClient)
  testProduct = (await setupTestProduct()).product
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