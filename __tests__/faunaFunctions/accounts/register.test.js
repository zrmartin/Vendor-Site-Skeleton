import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Register }} = require('../../../util/constants/database/functions')
const { ROLES: { owner }} = require('../../../util/constants/roles')
const { HTTP_CODES: { Success, Validation_Error }} = require('../../../util/constants/httpCodes')
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

test('Successfully create (register) a new account', async () => {
  const email = "test@test.com"
  const registerResponse = await adminClient.query(
    Call(Register, [
      {
        email,
        password: "password",
        roles: [owner]
      }
    ]
    )
  )

  expect(registerResponse.code).toEqual(Success);
  expect(registerResponse.message).toEqual("Account Created");
  expect(registerResponse.account.data.email).toEqual(email);
  expect(registerResponse.account.data.roles).toContain(owner);
});

test('Successfully return error when email is already taken', async () => {
  const testUser = {
    email: "test@test.com",
    password: "password",
    roles: [owner]
  }

  const registerResponse = await adminClient.query(
    Call(Register, [testUser])
  )
  const registerResponse2 = await adminClient.query(
    Call(Register, [testUser])
  )


  expect(registerResponse2.code).toEqual(Validation_Error);
  expect(registerResponse2.message).toEqual("Email is taken");
});