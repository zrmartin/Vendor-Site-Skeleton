import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Register }} = require('../../../util/constants/database/functions')
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

  expect(registerResponse.data.email).toEqual(email);
  expect(registerResponse.data.roles).toContain(owner);
});