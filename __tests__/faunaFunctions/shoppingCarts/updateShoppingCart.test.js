import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Update_Shopping_Cart }} = require('../../../util/constants/database/functions')
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
  userClient = await createTestUserAndClient(adminClient, "test@test.com", "password", [])
  await setupTestEntities()
})

afterEach(async () => {
  await destroyDatabase(databaseInfo)
})

test('Successfully updates existing shopping cart without deleting previous entries', async () => {
  const updatedShoppingCartProducts = {
    "2": 2,
    "3": 3
  }

  const updateShoppingCartRepsonse = await userClient.query(
    Call(Update_Shopping_Cart, [{
      id: testShoppingCart.ref.id,
      products: updatedShoppingCartProducts
    }])
  )

  const entireShoppingCart = {
    ...updatedShoppingCartProducts,
    ...testShoppingCart.data.products
  }

  expect(updateShoppingCartRepsonse.code).toEqual(Success);
  expect(updateShoppingCartRepsonse.message).toEqual("Shopping Cart Updated")
  expect(updateShoppingCartRepsonse.updatedShoppingCart.data.products).toMatchObject(entireShoppingCart)
});

test('Successfully returns error message if shopping cart does not exist', async () => {
  const updateShoppingCartRepsonse = await userClient.query(
    Call(Update_Shopping_Cart, [{
      id: "-1"
    }]),
  )
  expect(updateShoppingCartRepsonse.message).toEqual("Shopping Cart not found, could not update")
  expect(updateShoppingCartRepsonse.code).toEqual(Not_Found);
});

test('Successfully throws and error when trying to update a shopping cart that is not yours', async () => {
  const userClient2 = await createTestUserAndClient(adminClient, "test2@test.com", "password", [])
  let updateShoppingCartRepsonse

  try {
    updateShoppingCartRepsonse = await userClient2.query(
      Call(Update_Shopping_Cart, [{
        id: testShoppingCart.ref.id,
        products: {}
      }]),
    )
  }
  catch(e) {
    updateShoppingCartRepsonse = e
  }

  expect(updateShoppingCartRepsonse.requestResult.responseContent.errors).not.toBeNull();
  expect(updateShoppingCartRepsonse.requestResult.statusCode).not.toBeNull();
});