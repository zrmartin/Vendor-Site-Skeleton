import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Register, Login, Refresh_Token }} = require('../../../util/constants/database/functions')
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

test('Successfully Refresh token', async () => {
  const email = "test@test.com"
  const password = "password"
  const registerResponse = await adminClient.query(
    Call(Register, [email, password, [owner]])
  )

  const loginResponse = await adminClient.query(
    Call(Login, [email, password])
  )

  const userRefreshClient = new Client({
    secret: loginResponse.refresh.secret
  })

  const refreshTokenResponse = await userRefreshClient.query(
    Call(Refresh_Token)
  )

  expect(refreshTokenResponse.access).not.toEqual(null);
  expect(refreshTokenResponse.account).toMatchObject(loginResponse.account);
});

test('Calling Refresh Token with invalid secret throws error', async () => {
  let refreshTokenResponse
  try{
    refreshTokenResponse = await adminClient.query(
      Call(Refresh_Token)
    )
  }
  catch(e) {
    refreshTokenResponse = e
  }
  
  expect(refreshTokenResponse.requestResult.responseContent.errors).not.toBeNull();
  expect(refreshTokenResponse.requestResult.statusCode).not.toBeNull();
});
