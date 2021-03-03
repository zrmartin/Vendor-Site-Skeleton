import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUser, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Clear_Shopping_Cart }} = require('../../../util/constants/database/functions')
const { COLLECTIONS: { ShoppingCarts }} = require('../../../util/constants/database/collections')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
const { Call, Create, Collection, CurrentIdentity, Ref } = query
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
        products: {
          "123": 1,
          "456": 3
        }
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

test('Successfully clears an existing shopping cart', async () => {
  const response = await userClient.query(
    Call(Clear_Shopping_Cart, [{
      id: testShoppingCart.ref.id
    }])
  )

  expect(response.message).toEqual("Shopping Cart Cleared");
  expect(response.code).toEqual(Success);
  expect(response.updatedShoppingCart.data.products).toEqual({})
});

test('Successfully returns error message if shopping cart does not exist', async () => {
  const response = await userClient.query(
    Call(Clear_Shopping_Cart, [{
      id: "-1"
    }]),
  )
  expect(response.message).toEqual("Shopping Cart not found, could not clear")
  expect(response.code).toEqual(Not_Found);
});


test('Successfully throws and error when trying to clear a shopping cart that is not yours', async () => {
  const userData2 = await createTestUser(adminClient, "test2@test.com", "password", [])
  const userClient2 = new Client({
    secret: userData2.access.secret
  })
  let clearShoppingCartRepsonse

  try {
    clearShoppingCartRepsonse = await userClient2.query(
      Call(Clear_Shopping_Cart, [{
        id: testShoppingCart.ref.id
      }]),
    )
  }
  catch(e) {
    clearShoppingCartRepsonse = e
  }

  expect(clearShoppingCartRepsonse.requestResult.responseContent.errors).not.toBeNull();
  expect(clearShoppingCartRepsonse.requestResult.statusCode).not.toBeNull();
});