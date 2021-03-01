import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Get_Shopping_Cart }} = require('../../../util/constants/database/functions')
const { COLLECTIONS: { ShoppingCarts }} = require('../../../util/constants/database/collections')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
const { Call, Create, Collection, CurrentIdentity, Ref } = query
let adminClient
let userClient
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
  userClient = await createTestUserAndClient(adminClient, "test@test.com", "password", [])
  await setupTestEntities()
})

afterEach(async () => {
  await destroyDatabase(databaseInfo)
})


test('Successfully gets existing shopping cart', async () => {
  const response = await userClient.query(
    Call(Get_Shopping_Cart, [{
      id: testShoppingCart.ref.id
    }])
  )

  expect(response.code).toEqual(Success);
  expect(response.shoppingCart.data).toMatchObject(testShoppingCart.data)
});

test('Successfully returns error message if shopping cart does not exist', async () => {
  const response = await userClient.query(
    Call(Get_Shopping_Cart, [{
      id: "-1"
    }]),
  )
  expect(response.message).toEqual("Shopping Cart not found")
  expect(response.code).toEqual(Not_Found);
});