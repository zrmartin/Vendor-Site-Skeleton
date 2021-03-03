import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUser, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Get_Shopping_Cart_For_Account }} = require('../../../util/constants/database/functions')
const { COLLECTIONS: { ShoppingCarts }} = require('../../../util/constants/database/collections')
const { INDEXES: { Shopping_Cart_For_Account }} = require('../../../util/constants/database/indexes')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
const { Call, Delete, Index, Collection, Create, CurrentIdentity, Ref } = query
let adminClient
let userClient
let userData
let databaseInfo
let testShoppingCart

async function setupTestEntities() {
  testShoppingCart = await userClient.query(
    Create(Collection(ShoppingCarts), {
      data: {
        account: CurrentIdentity(),
        products: {}
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
  userData = await createTestUser(adminClient, "test@test.com", "password", [])
  userClient = new Client({
    secret: userData.access.secret
  })
  await setupTestEntities()
})

afterEach(async () => {
  await destroyDatabase(databaseInfo)
})

test('Successfully gets shopping cart for logged in user', async () => {
  const response = await userClient.query(
    Call(Get_Shopping_Cart_For_Account, [])
  )

  expect(response.code).toEqual(Success);
});

test('Successfully returns error message is Shopping_Cart_For_Account index does not exist', async () => {
  await adminClient.query(
    Delete(Index(Shopping_Cart_For_Account))
  )

  const response = await userClient.query(
    Call(Get_Shopping_Cart_For_Account, [])
  )

  expect(response.message).toEqual("Could not find Shopping_Cart_For_Account Index")
  expect(response.code).toEqual(Not_Found);
});