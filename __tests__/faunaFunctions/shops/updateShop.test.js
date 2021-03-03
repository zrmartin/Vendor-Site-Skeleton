import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUser, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Update_Shop }} = require('../../../util/constants/database/functions')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
const { ROLES: { owner }} = require('../../../util/constants/roles')
const { COLLECTIONS: { Shops }} = require('../../../util/constants/database/collections')
const { Call, Create, Collection, CurrentIdentity } = query
let adminClient
let userClient
let userData
let databaseInfo
let testShop

async function setupTestEntities() {
  testShop = await userClient.query(
    Create(Collection(Shops), {
      data: {
        account: CurrentIdentity(),
        name: "Test Shop"
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

test('Successfully updates existing shop', async () => {
  const UpdatedShop = {
    name: "Updated Shop Name",
  }

  const updateShopReponse = await userClient.query(
    Call(Update_Shop, [{
      id: testShop.ref.id,
      ...UpdatedShop
    }])
  )

  expect(updateShopReponse.code).toEqual(Success);
  expect(updateShopReponse.message).toEqual("Shop Updated")
  expect(updateShopReponse.updatedShop.data).toMatchObject(UpdatedShop)
});

test('Successfully returns error message if shop does not exist', async () => {
  const response = await userClient.query(
    Call(Update_Shop, [{
      id: "-1"
    }]),
  )
  expect(response.message).toEqual("Shop not found, could not update")
  expect(response.code).toEqual(Not_Found);
});

test('Successfully throws an error when trying to update a shop that is not yours', async () => {
  const userData2 = await createTestUser(adminClient, "test2@test.com", "password", [owner])
  const userClient2 = new Client({
    secret: userData2.access.secret
  })
  let updateShopRepsonse
  try {
    updateShopRepsonse = await userClient2.query(
      Call(Update_Shop, [{
        id: testShop.ref.id,
        name: "Updated Shop Name"
      }]),
    )
  }
  catch(e) {
    updateShopRepsonse = e
  }

  expect(updateShopRepsonse.requestResult.responseContent.errors).not.toBeNull();
  expect(updateShopRepsonse.requestResult.statusCode).not.toBeNull();
});