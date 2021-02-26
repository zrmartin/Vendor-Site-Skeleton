import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Register, Login, Logout }} = require('../../../util/constants/database/functions')
const { ROLES: { owner }} = require('../../../util/constants/roles')
const { Call, Count, Tokens } = query
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

test('Logout deletes current refresh tokens, access tokens, and account sessions, other sessions associated with this account are not removed', async () => {
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
  // Login a second time to create another session and set of access/refresh token
  // We want this second pair to persist after logging out 
  await adminClient.query(
    Call(Login, [email, password])
  )

  const userRefreshClient = new Client({
    secret: loginResponse.refresh.secret
  })

  const logoutResponse = await userRefreshClient.query(
    Call(Logout)
  )
  const numOfDatabaseTokens = await adminClient.query(
    Count(Tokens())
  )

  expect(logoutResponse.sessionLoggedOut).toEqual(true);
  expect(logoutResponse.accountLoggedOut).toBeGreaterThan(0);
  expect(numOfDatabaseTokens).toBeGreaterThan(0);
});

test('Calling Logout with invalid secret throws error', async () => {
  let refreshTokenResponse
  try{
    refreshTokenResponse = await adminClient.query(
      Call(Logout)
    )
  }
  catch(e) {
    refreshTokenResponse = e
  }
  
  expect(refreshTokenResponse.requestResult.responseContent.errors).not.toBeNull();
  expect(refreshTokenResponse.requestResult.statusCode).not.toBeNull();
});
