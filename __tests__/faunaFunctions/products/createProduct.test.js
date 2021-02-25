import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, createTestUserAndClient, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Create_Product }} = require('../../../util/constants/database/functions')
const { HTTP_CODES: { Success }} = require('../../../util/constants/httpCodes')
const { Call } = query
let adminClient
let userClient
let databaseInfo

beforeEach(async () => {
  databaseInfo = await createChildDatabase()
  adminClient = new Client({
    secret: databaseInfo.key.secret
  })
  await setupDatabase(adminClient)
  userClient = await createTestUserAndClient(adminClient, "test@test.com", "password")
})
afterEach(async () => {
  await destroyDatabase(databaseInfo)
})

test('Successfully create new product', async () => {
  const body = {
    name: "Test Product",
    price: 100,
    quantity: 1
  }

  const response = await userClient.query(
    Call(Create_Product, [body])
  )

  expect(response.product.data.name).toEqual(body.name);
  expect(response.product.data.price).toEqual(body.price);
  expect(response.product.data.quantity).toEqual(body.quantity);
  expect(response.code).toEqual(Success);
  expect(response.message).toEqual("Product Created")
});