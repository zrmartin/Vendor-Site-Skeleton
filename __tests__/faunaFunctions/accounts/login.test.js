import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Register, Login }} = require('../../../util/constants/database/functions')
const { ROLES: { owner }} = require('../../../util/constants/roles')
const { Call } = query
let adminClient
let databaseInfo

beforeEach(async () => {
  databaseInfo = await createChildDatabase()
  adminClient = new Client({
    secret: databaseInfo.key.secret
  })
  await setupDatabase(adminClient)
})
afterEach(async () => {
  await destroyDatabase(databaseInfo)
})

test('Successfully login to existing account', async () => {
  const email = "test@test.com"
  const password = "password"
  const registerResponse = await adminClient.query(
    Call(Register, [
      {
        email, 
        password, 
        roles: [owner]
      }
    ])
  )

  const loginResponse = await adminClient.query(
    Call(Login, [email, password])
  )

  expect(loginResponse.access).not.toEqual(false);
  expect(loginResponse.refresh).not.toEqual(false);
  expect(loginResponse.account).not.toEqual(false);
});

test('Return false when email does not exist', async () => {
  const email = "test@test.com"
  const password = "password"

  const loginResponse = await adminClient.query(
    Call(Login, [email, password])
  )

  expect(loginResponse.access).toEqual(false);
  expect(loginResponse.refresh).toEqual(false);
  expect(loginResponse.account).toEqual(false);
});

test('Return false when password is invalid', async () => {
  const email = "test@test.com"
  const password = "password"
  const registerResponse = await adminClient.query(
    Call(Register, [
      {
        email, 
        password, 
        roles: [owner]
      }
    ])
  )

  const loginResponse = await adminClient.query(
    Call(Login, [email, "InvalidPassword"])
  )

  expect(loginResponse.access).toEqual(false);
  expect(loginResponse.refresh).toEqual(false);
  expect(loginResponse.account).toEqual(false);
});
