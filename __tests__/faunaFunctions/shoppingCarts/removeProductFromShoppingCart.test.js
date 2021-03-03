import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUser, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Remove_Product_From_Shopping_Cart }} = require('../../../util/constants/database/functions')
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
          "1": 1
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

test('Successfully removes existing item from shopping cart', async () => {
  const removeProductFromShoppingCartRepsonse = await userClient.query(
    Call(Remove_Product_From_Shopping_Cart, [{
      id: testShoppingCart.ref.id,
      productId: "1"
    }])
  )

  expect(removeProductFromShoppingCartRepsonse.code).toEqual(Success);
  expect(removeProductFromShoppingCartRepsonse.message).toEqual("Product Removed")
  expect(removeProductFromShoppingCartRepsonse.updatedShoppingCart.data.products).toEqual({})
});

test('Successfully returns error message if shopping cart does not exist', async () => {
  const removeProductFromShoppingCartRepsonse = await userClient.query(
    Call(Remove_Product_From_Shopping_Cart, [{
      id: "-1",
    }]),
  )
  expect(removeProductFromShoppingCartRepsonse.message).toEqual("Shopping Cart not found, could not remove product")
  expect(removeProductFromShoppingCartRepsonse.code).toEqual(Not_Found);
});

test('Successfully returns shopping cart if trying to remove product by Id that does not exist', async () => {
  const removeProductFromShoppingCartRepsonse = await userClient.query(
    Call(Remove_Product_From_Shopping_Cart, [{
      id: testShoppingCart.ref.id,
      productId: "123"
    }])
  )
  expect(removeProductFromShoppingCartRepsonse.code).toEqual(Success);
  expect(removeProductFromShoppingCartRepsonse.message).toEqual("Product Removed")
  expect(removeProductFromShoppingCartRepsonse.updatedShoppingCart.data.products).toMatchObject(testShoppingCart.data.products)
});

test('Successfully throws and error when trying to update a shopping cart that is not yours', async () => {
  const userData2 = await createTestUser(adminClient, "test2@test.com", "password", [])
  const userClient2 = new Client({
    secret: userData2.access.secret
  })
  let removeProductFromShoppingCartRepsonse

  try {
    removeProductFromShoppingCartRepsonse = await userClient2.query(
      Call(Remove_Product_From_Shopping_Cart, [{
        id: testShoppingCart.ref.id,
        productId: "1"
      }]),
    )
  }
  catch(e) {
    removeProductFromShoppingCartRepsonse = e
  }

  expect(removeProductFromShoppingCartRepsonse.requestResult.responseContent.errors).not.toBeNull();
  expect(removeProductFromShoppingCartRepsonse.requestResult.statusCode).not.toBeNull();
});