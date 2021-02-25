import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Get_Product, Create_Product, Create_Images }} = require('../../../util/constants/database/functions')
const { COLLECTIONS: { Products }} = require('../../../util/constants/database/collections')
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
  userClient = await createTestUserAndClient(adminClient, "test@test.com", "password")
  testProduct = (await setupTestProduct()).product
})

afterEach(async () => {
  await destroyDatabase(databaseInfo)
})


test('Successfully gets existing product', async () => {
  // Create images to see if they are successfully retrieved
  const imageKeys = ["123", "456"]
  await userClient.query(
    Call(Create_Images, [{
      imageKeys,
      entityId: testProduct.ref.id,
      entityCollection: Products
    }]
    )
  )

  const response = await userClient.query(
    Call(Get_Product, [{
      id: testProduct.ref.id
    }])
  )
  const productImageKeys = response.images.map(image => image.data.key)

  expect(response.code).toEqual(Success);
  expect(response.images.length).toEqual(imageKeys.length)
  expect(productImageKeys).toIncludeSameMembers(imageKeys)
  expect(response.product.data).toMatchObject(testProduct.data)
});

test('Successfully returns error message if product does not exist', async () => {
  const response = await userClient.query(
    Call(Get_Product, [{
      id: "-1"
    }]),
  )
  expect(response.message).toEqual("Product not found")
  expect(response.code).toEqual(Not_Found);
});