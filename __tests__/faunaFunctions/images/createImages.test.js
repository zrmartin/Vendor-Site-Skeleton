import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Create_Images }} = require('../../../util/constants/database/functions')
const { HTTP_CODES: { Success }} = require('../../../util/constants/httpCodes')
const { COLLECTIONS: { Products }} = require('../../../util/constants/database/collections')
const { ROLES: { owner }} = require('../../../util/constants/roles')
const { Call } = query
let adminClient
let userClient
let databaseInfo

beforeEach(async () => {
  databaseInfo = await createChildDatabase()
  adminClient = new Client({
    secret: databaseInfo.key.secret
  })
  await setupDatabase(adminClient)
  userClient = await createTestUserAndClient(adminClient, "test@test.com", "password", [owner])
})
afterEach(async () => {
  await destroyDatabase(databaseInfo)
})

test('Successfully create a single new image for a product', async () => {
  const imageKeys = ["123"]
  const imageResponse = await userClient.query(
    Call(Create_Images, [{
      imageKeys,
      entityId: "123",
      entityCollection: Products
    }])
  )
  const createdImageKeys = imageResponse.images.map(image => image.data.key)

  expect(imageResponse.code).toEqual(Success);
  expect(imageResponse.images.length).toEqual(imageKeys.length);
  expect(createdImageKeys).toIncludeSameMembers(imageKeys);
});

test('Successfully create multiple new images for a product', async () => {
  const imageKeys = ["123", "456"]
  const imageResponse = await userClient.query(
    Call(Create_Images, [{
      imageKeys,
      entityId: "123",
      entityCollection: Products
    }])
  )
  const createdImageKeys = imageResponse.images.map(image => image.data.key)
  
  expect(imageResponse.code).toEqual(Success);
  expect(imageResponse.images.length).toEqual(imageKeys.length);
  expect(createdImageKeys).toIncludeSameMembers(imageKeys);
});