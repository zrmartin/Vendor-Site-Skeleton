import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Create_Images, Create_Product, Delete_Image }} = require('../../../util/constants/database/functions')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
const { COLLECTIONS: { Products }} = require('../../../util/constants/database/collections')
const { Call, Delete, Index } = query
let adminClient
let userClient
let databaseInfo

beforeEach(async () => {
  databaseInfo = await createChildDatabase()
  adminClient = new Client({
    secret: databaseInfo.key.secret
  })
  await setupDatabase(adminClient)
  userClient = await createTestUserAndClient(adminClient, "test@test.com", "password")
})
afterEach(async () => {
  await destroyDatabase(databaseInfo)
})

test('Successfully deletes an image when found', async () => {
  const imageKeys = ["123"]

  const imageResponse = await userClient.query(
    Call(Create_Images, [{
      imageKeys,
      entityId: "1",
      entityCollection: Products
    }])
  )
  const imageId = imageResponse.images[0].ref.id

  const deleteImageRepsonse = await userClient.query(
    Call(Delete_Image, [{
      id: imageId
    }])
  )

  expect(deleteImageRepsonse.code).toEqual(Success);
  expect(deleteImageRepsonse.message).toEqual("Image Deleted");
  expect(deleteImageRepsonse.deletedImage.ref.id).toEqual(imageId);
});

test('Successfully returns error if image not found', async () => {
  const deleteImageRepsonse = await userClient.query(
    Call(Delete_Image, [{
      id: "123"
    }])
  )

  expect(deleteImageRepsonse.code).toEqual(Not_Found);
  expect(deleteImageRepsonse.message).toEqual("Image not found, could not delete");
});