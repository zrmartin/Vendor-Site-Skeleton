import { query, Client } from 'faunadb'
const { Call } = query
import { createChildDatabase, setupDatabase, destroyDatabase } from '../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Create_Product }} = require('../../util/constants/database/functions')
const { HTTP_CODES: { Success }} = require('../../util/constants/httpCodes')
let client
let databaseInfo

beforeEach(async () => {
  databaseInfo = await createChildDatabase()
  client = new Client({
    secret: databaseInfo.key.secret
  })
  client = await setupDatabase(client)
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

  const response = await client.query(
    Call(Create_Product, [body])
  )

  expect(response.product.data.name).toEqual(body.name);
  expect(response.product.data.price).toEqual(body.price);
  expect(response.product.data.quantity).toEqual(body.quantity);
  expect(response.code).toEqual(Success);
  expect(response.message).toEqual("Product Created")
});