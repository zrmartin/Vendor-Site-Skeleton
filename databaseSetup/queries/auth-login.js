const faunadb = require('faunadb')
const { CreateAccessAndRefreshToken } = require( './auth-tokens')
const { INDEXES: { Accounts_By_Email, Access_Tokens_By_Session, Tokens_By_Instance, Account_Sessions_By_Account }} = require('../../util/constants/database/indexes')

const q = faunadb.query
const {
  Match,
  Index,
  Var,
  Get,
  Let,
  Select,
  Paginate,
  Identify,
  If,
  CurrentIdentity,
  Logout,
  Lambda,
  Delete,
  Count,
  Union,
  Exists
} = q

/* We can write our own custom login function by using 'Identify()' in combination with 'Create(Tokens(), ...)' instead of 'Login()'
 * which is useful if you want to write custom login behaviour.
 */
function LoginAccount(email, password) {
  return If(
    // First check whether the account exists
    Exists(Match(Index(Accounts_By_Email), email)),
    // If not, we can skip all below.
    Let(
      {
        accountRef: Select([0], Paginate(Match(Index(Accounts_By_Email), email))),
        account: Get(Var('accountRef')),
        // First we verify whether our login credentials are correct without retrieving a token using Identify.
        authenticated: Identify(Var('accountRef'), password),
        // Then we make a token manually in case authentication succeeded. By default the Login function
        // would provide an instance, but it would not add data to the token. Here we will use it to
        // differentiate between a refresh and an access token.
        tokens: If(Var('authenticated'), CreateAccessAndRefreshToken(Var('accountRef')), false)
      },
      {
        access: Select(['access'], Var('tokens'), false),
        refresh: Select(['refresh'], Var('tokens'), false),
        account: If(Var('authenticated'), Var('account'), false) // Do not give information about existance of the account
      }
    ),
    // just return false for each in case the account doesn't exist.
    {
      access: false,
      refresh: false,
      account: false
    }
  )
}

function LogoutCurrentSession() {
  return Let(
    {
      // Get the session (this function is called from the backend using the refresh token)
      sessionRef: CurrentIdentity(),
      accessTokens: Match(Index(Access_Tokens_By_Session), Var('sessionRef'))
    },
    {
      // we can return the results to see whether it worked
      // logout should return true or false on false.
      sessionLoggedOut: Logout(false), // this logs out the session token
      // while when we delete something with 'Delete' it would return the deleted object on success.
      // we'll modify that and just return a count of how many tokens that were deleted.
      accountLoggedOut: DeleteAllAndCount(Select(['data'], Paginate(Var('accessTokens'), { size: 100000 })))
    }
  )
}

function LogoutAllSessions() {
  return Let(
    {
      // Get the session (this function is called from the backend using the refresh token)
      sessionRef: CurrentIdentity(),
      session: Get(Var('sessionRef')),
      accountRef: Select(['data', 'account'], Var('session')),
      allAccountTokens: Match(Index(Tokens_By_Instance), Var('accountRef')),
      allAccountSessions: Match(Index(Account_Sessions_By_Account), Var('accountRef')),
      // there might be other sessions for this account (other devices)
      allSessions: Paginate(Match(Index(Account_Sessions_By_Account), Var('accountRef')), { size: 100000 }),
      allRefreshTokens: q.Map(
        Var('allSessions'),
        Lambda(
          ['otherSessionRef'],
          Select(['data'], Paginate(Match(Index(Tokens_By_Instance), Var('otherSessionRef'))))
        )
      )
    },
    {
      allRefreshTokensDeleted: DeleteAllAndCount(Union(Select(['data'], Var('allRefreshTokens')))),
      allAccountTokens: DeleteAllAndCount(Select(['data'], Paginate(Var('allAccountTokens')))),
      allAccountSessionsDeleted: DeleteAllAndCount(Select(['data'], Paginate(Var('allAccountSessions'))))
    }
  )
}

function DeleteAllAndCount(pageOfTokens) {
  return Count(q.Map(pageOfTokens, Lambda(['tokenRef'], Delete(Var('tokenRef')))))
}

module.exports = { LoginAccount, LogoutAllSessions, LogoutCurrentSession }
