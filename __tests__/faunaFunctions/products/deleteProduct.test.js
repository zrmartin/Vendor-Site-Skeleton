import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Delete_Product, Create_Product, Create_Images }} = require('../../../util/constants/database/functions')
const { COLLECTIONS: { Products }} = require('../../../util/constants/database/collections')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
const { ROLES: { owner }} = require('../../../util/constants/roles')
const { Call } = query
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

test('Successfully deletes existing product', async () => {
  // Create images to see if they are successfully deleted
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
    Call(Delete_Product, [{
      id: testProduct.ref.id,
    }])
  )
  const deletedImageKeys = response.deletedImages?.map(deletedImage => deletedImage.data.key)

  expect(response.code).toEqual(Success);
  expect(response.message).toEqual("Product Deleted")
  expect(response.deletedImages.length).toEqual(imageKeys.length)
  expect(deletedImageKeys).toIncludeSameMembers(imageKeys)
  expect(response.deletedProduct.data).toMatchObject(testProduct.data)
});

test('Successfully returns error message if product does not exist', async () => {
  const response = await userClient.query(
    Call(Delete_Product, [{
      id: "-1"
    }]),
  )
  expect(response.message).toEqual("Product not found, could not delete")
  expect(response.code).toEqual(Not_Found);
});

test('Successfully throws an exception when trying to delete a product that is not yours', async () => {
  const userClient2 = await createTestUserAndClient(adminClient, "test2@test.com", "password", [owner])
  let deleteProductResponse

  try {
    deleteProductResponse = await userClient2.query(
      Call(Delete_Product, [{
        id: testProduct.ref.id
      }]),
    )
  }
  catch(e) {
    deleteProductResponse = e
  }

  expect(deleteProductResponse.requestResult.responseContent.errors).not.toBeNull();
  expect(deleteProductResponse.requestResult.statusCode).not.toBeNull();
});