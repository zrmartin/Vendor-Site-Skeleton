const faunadb = require('faunadb')
const { INDEXES: { Accounts_By_Email, Access_Tokens_By_Session, Tokens_By_Instance, Account_Sessions_By_Account }} = require('../../util/constants/database/indexes')
const { COLLECTIONS: { Accounts, Account_Sessions } } = require('../../util/constants/database/collections')

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
  Exists,
  Create,
  Collection,
  Tokens,
  TimeAdd,
  Now
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

function RegisterAccount(email, password) {
  return Create(Collection(Accounts), {
    // credentials is a special field, the contents will never be returned
    // and will be encrypted. { password: ... } is the only format it currently accepts.
    credentials: { password: password },
    // everything you want to store in the document should be scoped under 'data'
    data: {
      email: email
    }
  })
}

function CreateAccessToken(instance, sessionDoc) {
  return Create(Tokens(), {
    instance: instance,
    // A  token is just like a document (everything in FaunaDB is),
    // we can store metadata on the token if we'd like.
    data: {
      // We do not do anything with the type, it's just for readability in case we retrieve a token later on
      type: 'access',
      // We store which refresh token that created the access tokens.
      // That way we can invalidate access tokens that were granted by this refresh token if we'd like.
      session: Select(['ref'], sessionDoc)
    },
    // access tokens live for 10 minutes, which is typically a good livetime for short-lived tokens.
    ttl: TimeAdd(Now(), 10, 'minutes')
  })
}

function CreateRefreshToken(accountRef) {
  return Let(
    {
      session_refresh: Create(Collection(Account_Sessions), {
        data: {
          account: accountRef
        }
      })
    },
    {
      token: Create(Tokens(), {
        instance: Select(['ref'], Var('session_refresh')),
        // 8 hours is a good time for refresh tokens.
        ttl: TimeAdd(Now(), 8, 'hour'),
        data: {
          // We do not do anything with the type, it's just for readability in case we retrieve a token later on
          type: 'refresh'
        }
      }),
      session_refresh_doc: Var('session_refresh')
    }
  )
}

function CreateAccessAndRefreshToken(instance) {
  return Let(
    {
      refresh: CreateRefreshToken(instance),
      access: CreateAccessToken(instance, Select(['session_refresh_doc'], Var('refresh')))
    },
    {
      refresh: Select(['token'], Var('refresh')),
      access: Var('access')
    }
  )
}

function RefreshToken() {
  return Let(
    {
      // First get the document that the token is linked with (from the 'account_sessions' collection )
      session: Get(CurrentIdentity())
    },
    Let(
      {
        account: Get(Select(['data', 'account'], Var('session'))),
        access: CreateAccessToken(Select(['ref'], Var('account')), Var('session'))
      },
      {
        account: Var('account'),
        access: Var('access')
      }
    )
  )
}

module.exports = { LoginAccount, LogoutAllSessions, LogoutCurrentSession, RefreshToken, RegisterAccount }
