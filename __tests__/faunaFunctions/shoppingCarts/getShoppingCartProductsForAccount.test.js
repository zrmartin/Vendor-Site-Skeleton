import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUser, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Get_Shopping_Cart_Products_For_Account }} = require('../../../util/constants/database/functions')
const { COLLECTIONS: { ShoppingCarts, Products, Shops, Accounts }} = require('../../../util/constants/database/collections')
const { INDEXES: { Shopping_Cart_For_Account }} = require('../../../util/constants/database/indexes')
const { HTTP_CODES: { Success, Not_Found }} = require('../../../util/constants/httpCodes')
const { Call, Delete, Index, Collection, Create, CurrentIdentity, Ref } = query
let adminClient
let userClient
let userData
let databaseInfo
let testShoppingCart
let testProduct1
let testProduct2

async function setupTestEntities() {
  testProduct1 = await adminClient.query(
    Create(Collection(Products), {
      data: {
        account: Ref(Collection(Accounts), "123"),
        shop: Ref(Collection(Shops), "123"),
        name: "Test Product",
        price: 100,
        quantity: 10
      }
    })
  )
  testProduct2 = await adminClient.query(
    Create(Collection(Products), {
      data: {
        account: Ref(Collection(Accounts), "123"),
        shop: Ref(Collection(Shops), "123"),
        name: "Test Product 2",
        price: 200,
        quantity: 20
      }
    })
  )
  testShoppingCart = await userClient.query(
    Create(Collection(ShoppingCarts), {
      data: {
        account: CurrentIdentity(),
        products: {
          [testProduct1.ref.id]: 5,
          [testProduct2.ref.id]: 7
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

test('Successfully gets all products in shopping cart for logged in user', async () => {
  const response = await userClient.query(
    Call(Get_Shopping_Cart_Products_For_Account, [])
  )
  const shoppingCartData = response.shoppingCart.map((item) => {
    return {
      product: item.product.data,
      quantity: item.quantity
    }
  })

  expect(response.code).toEqual(Success);
  expect(shoppingCartData).toContainEqual({
    product: testProduct1.data,
    quantity: 5
  })
  expect(shoppingCartData).toContainEqual({
    product: testProduct2.data,
    quantity: 7
  })
});

test('Successfully returns error message is Shopping_Cart_For_Account index does not exist', async () => {
  await adminClient.query(
    Delete(Index(Shopping_Cart_For_Account))
  )

  const response = await userClient.query(
    Call(Get_Shopping_Cart_Products_For_Account, [])
  )

  expect(response.message).toEqual("Could not find Shopping_Cart_For_Account Index")
  expect(response.code).toEqual(Not_Found);
});