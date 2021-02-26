import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Create_Product, Create_Shop }} = require('../../../util/constants/database/functions')
const { HTTP_CODES: { Success }} = require('../../../util/constants/httpCodes')
const { ROLES: { owner }} = require('../../../util/constants/roles')
const { Call } = query
let adminClient
let userClient
let databaseInfo
let testShop

async function setupTestEntities() {
  testShop = (await userClient.query(
    Call(Create_Shop, [{
        name: "Test Shop",
    }])
  )).shop
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

test('Successfully create new product', async () => {
  const body = {
    shopId: testShop.ref.id,
    name: "Test Product",
    price: 100,
    quantity: 1
  }

  const createProductReponse = await userClient.query(
    Call(Create_Product, [body])
  )

  expect(createProductReponse.product.data.shop).toMatchObject(testShop.ref);
  expect(createProductReponse.product.data.name).toEqual(body.name);
  expect(createProductReponse.product.data.price).toEqual(body.price);
  expect(createProductReponse.product.data.quantity).toEqual(body.quantity);
  expect(createProductReponse.code).toEqual(Success);
  expect(createProductReponse.message).toEqual("Product Created")
});