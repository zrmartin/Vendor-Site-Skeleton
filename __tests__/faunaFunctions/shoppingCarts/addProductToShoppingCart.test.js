import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUser, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Add_Product_To_Shopping_Cart }} = require('../../../util/constants/database/functions')
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

test('Successfully adds a new item to shopping cart', async () => {
  const productId = "2"
  const quantity = 2

  const addProductToShoppingCartRepsonse = await userClient.query(
    Call(Add_Product_To_Shopping_Cart, [{
      id: testShoppingCart.ref.id,
      productId,
      quantity
    }])
  )
  const updatedShoppingCart = {
    ...testShoppingCart.data.products,
    [productId]: quantity
  }

  expect(addProductToShoppingCartRepsonse.code).toEqual(Success);
  expect(addProductToShoppingCartRepsonse.message).toEqual("Product Added")
  expect(addProductToShoppingCartRepsonse.updatedShoppingCart.data.products).toMatchObject(updatedShoppingCart)
});

test('Successfully updated quantity of existing item', async () => {
  const removeProductFromShoppingCartRepsonse = await userClient.query(
    Call(Add_Product_To_Shopping_Cart, [{
      id: testShoppingCart.ref.id,
      productId: "1",
      quantity: 1
    }])
  )
  
  expect(removeProductFromShoppingCartRepsonse.code).toEqual(Success);
  expect(removeProductFromShoppingCartRepsonse.message).toEqual("Product Added")
  expect(removeProductFromShoppingCartRepsonse.updatedShoppingCart.data.products["1"]).toEqual(2)
});

test('Successfully returns error message if shopping cart does not exist', async () => {
  const addProductToShoppingCartRepsonse = await userClient.query(
    Call(Add_Product_To_Shopping_Cart, [{
      id: "-1",
    }]),
  )
  expect(addProductToShoppingCartRepsonse.message).toEqual("Shopping Cart not found, could not add product")
  expect(addProductToShoppingCartRepsonse.code).toEqual(Not_Found);
});

test('Successfully throws and error when trying to update a shopping cart that is not yours', async () => {
  const userData2 = await createTestUser(adminClient, "test2@test.com", "password", [])
  const userClient2 = new Client({
    secret: userData2.access.secret
  })
  let addProductToShoppingCartRepsonse

  try {
    addProductToShoppingCartRepsonse = await userClient2.query(
      Call(Add_Product_To_Shopping_Cart, [{
        id: testShoppingCart.ref.id,
        productId: "2",
        quantity: 2
      }]),
    )
  }
  catch(e) {
    addProductToShoppingCartRepsonse = e
  }

  expect(addProductToShoppingCartRepsonse.requestResult.responseContent.errors).not.toBeNull();
  expect(addProductToShoppingCartRepsonse.requestResult.statusCode).not.toBeNull();
});