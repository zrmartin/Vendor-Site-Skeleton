import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Get_Shop }} = require('../../../util/constants/database/functions')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
const { ROLES: { owner }} = require('../../../util/constants/roles')
const { COLLECTIONS: { Shops }} = require('../../../util/constants/database/collections')
const { Call, Create, Collection, CurrentIdentity } = query
let adminClient
let userClient
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
  userClient = await createTestUserAndClient(adminClient, "test@test.com", "password", [owner])
  await setupTestEntities()
})

afterEach(async () => {
  await destroyDatabase(databaseInfo)
})

test('Successfully gets existing shop', async () => {
  const getShopResponse = await userClient.query(
    Call(Get_Shop, [{
      id: testShop.ref.id
    }])
  )

  expect(getShopResponse.code).toEqual(Success);
  expect(getShopResponse.shop.data).toMatchObject(testShop.data)
});

test('Successfully returns error message if shop does not exist', async () => {
  const response = await userClient.query(
    Call(Get_Shop, [{
      id: "-1"
    }]),
  )
  expect(response.message).toEqual("Shop not found")
  expect(response.code).toEqual(Not_Found);
});