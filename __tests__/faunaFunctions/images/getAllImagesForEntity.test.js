import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Create_Images, Get_All_Images_For_Entity }} = require('../../../util/constants/database/functions')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
const { COLLECTIONS: { Products, Shops }} = require('../../../util/constants/database/collections')
const { INDEXES: { All_Images_For_Entity }} = require('../../../util/constants/database/indexes')
const { ROLES: { owner }} = require('../../../util/constants/roles')
const { Call, Delete, Index, Create, Collection, CurrentIdentity, Ref } = query
let adminClient
let userClient
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
  userClient = await createTestUserAndClient(adminClient, "test@test.com", "password", [owner])
  await setupTestEntities()
})
afterEach(async () => {
  await destroyDatabase(databaseInfo)
})

test('Successfully gets all images for a given product', async () => {
  const imageKeys = ["123"]
  const imageResponse = await userClient.query(
    Call(Create_Images, [{
      imageKeys,
      entityId: testProduct.ref.id,
      entityCollection: Products
    }])
  )

  const allImagesForEntityRepsonse = await userClient.query(
    Call(Get_All_Images_For_Entity, [{
      entityId: testProduct.ref.id,
      entityCollection: Products
    }])
  )

  expect(allImagesForEntityRepsonse.code).toEqual(Success);
  expect(allImagesForEntityRepsonse.images.length).toEqual(imageKeys.length);
  expect(allImagesForEntityRepsonse.images.map(image => image.data.key)).toIncludeSameMembers(imageKeys);
});

test('Successfully returns error if AllImagesForEntity Index does not exist', async () => {
  await adminClient.query(
    Delete(Index(All_Images_For_Entity))
  )

  const allImagesForEntityRepsonse = await userClient.query(
    Call(Get_All_Images_For_Entity, [{
      entityId: "123",
      entityCollection: Products
    }])
  )

  expect(allImagesForEntityRepsonse.code).toEqual(Not_Found);
  expect(allImagesForEntityRepsonse.message).toEqual("Could not find All_Images_For_Entity Index");
});

test('Successfully returns empty array if entity not found', async () => {
  const allImagesForEntityRepsonse = await userClient.query(
    Call(Get_All_Images_For_Entity, [{
      entityId: "123",
      entityCollection: Products
    }])
  )
  
  expect(allImagesForEntityRepsonse.code).toEqual(Success);
  expect(allImagesForEntityRepsonse.images.length).toEqual(0);
});