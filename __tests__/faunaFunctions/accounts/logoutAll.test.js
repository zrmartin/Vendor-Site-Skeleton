import { query, Client } from 'faunadb'
import { createChildDatabase, setupDatabase, destroyDatabase } from '../../../databaseSetup/setup/testDatabase'
const { FUNCTIONS: { Register, Login, Logout_All }} = require('../../../util/constants/database/functions')
const { COLLECTIONS: { Account_Sessions }} = require('../../../util/constants/database/collections')
const { ROLES: { owner }} = require('../../../util/constants/roles')
const { Call, Count, Tokens, Documents, Collection } = query
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

test('Logout All deletes all refresh tokens, access tokens, and account sessions', async () => {
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

  const userRefreshClient = new Client({
    secret: loginResponse.refresh.secret
  })

  const logoutAllResponse = await userRefreshClient.query(
    Call(Logout_All)
  )

  const numOfDatabaseTokens = await adminClient.query(
    Count(Tokens())
  )
  const numOfDatabaseAccountSessions = await adminClient.query(
    Count(Documents(Collection(Account_Sessions)))
  )

  expect(logoutAllResponse.allRefreshTokensDeleted).toBeGreaterThan(0);
  expect(logoutAllResponse.allAccountTokens).toBeGreaterThan(0);
  expect(logoutAllResponse.allAccountSessionsDeleted).toBeGreaterThan(0);
  expect(numOfDatabaseTokens).toEqual(0);
  expect(numOfDatabaseAccountSessions).toEqual(0);
});

test('Calling Logout All with invalid secret throws error', async () => {
  let refreshTokenResponse
  try{
    refreshTokenResponse = await adminClient.query(
      Call(Logout_All)
    )
  }
  catch(e) {
    refreshTokenResponse = e
  }
  
  expect(refreshTokenResponse.requestResult.responseContent.errors).not.toBeNull();
  expect(refreshTokenResponse.requestResult.statusCode).not.toBeNull();
});
