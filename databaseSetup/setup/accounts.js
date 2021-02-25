const { DeleteIfExists, IfNotExists, executeFQL, CreateOrUpdateRole, CreateOrUpdateFunction } = require('../helpers/fql')
const { LoginAccount, LogoutAllSessions, LogoutCurrentSession, RefreshToken, RegisterAccount  } = require('../queries/accounts')
const { COLLECTIONS: { Accounts, Account_Sessions } } = require('../../util/constants/database/collections')
const { INDEXES: { All_Accounts, Accounts_By_Email, Access_Tokens_By_Session, Account_Sessions_By_Account, Tokens_By_Instance }} = require('../../util/constants/database/indexes')
const { FUNCTIONS: { Register, Login, Refresh_Token, Logout_All, Logout }} = require('../../util/constants/database/functions')
const { FUNCTION_ROLES: { FunctionRole_Login, FunctionRole_Register, FunctionRole_Refresh_Tokens_Logout }} = require('../../util/constants/database/functionRoles')
const { MEMBERSHIP_ROLES: { MembershipRole_Refresh_Logout }} = require('../../util/constants/database/membershipRoles')

const faunadb = require('faunadb')
const q = faunadb.query
const { CreateCollection, CreateIndex, Collection, Index, Tokens, Query, Lambda, Var, Let, Select } = q

/* Collection */
const CreateAccountsCollection = CreateCollection({ name: Accounts })
const CreateAccountsSessionRefreshCollection = CreateCollection({ name: Account_Sessions })

/* Indexes */
const CreateIndexAllAccounts = (accountsCollection) => CreateIndex({
  name: All_Accounts,
  source: accountsCollection,
  // this is the default collection index, no terms or values are provided
  // which means the index will sort by reference and return only the reference.
  serialized: true
})

const CreateIndexAccountsByEmail = (accountsCollection) => CreateIndex({
  name: Accounts_By_Email,
  source: accountsCollection,
  // We will search on email
  terms: [
    {
      field: ['data', 'email']
    }
  ],
  // if no values are added, the index will just return the reference.
  // Prevent that accounts with duplicate e-mails are made.
  // uniqueness works on the combination of terms/values
  unique: true,
  serialized: true
})

const CreateIndexAccessTokensByRefreshTokens = CreateIndex({
  name: Access_Tokens_By_Session,
  source: Tokens(),
  terms: [
    {
      field: ['data', 'session']
    }
  ],
  unique: false,
  serialized: true
})

const CreateIndexSessionByAccount = (accountSessionsCollection) => CreateIndex({
  name: Account_Sessions_By_Account,
  source: accountSessionsCollection,
  terms: [
    {
      field: ['data', 'account']
    }
  ],
  unique: false,
  serialized: true
})

const CreateIndexTokensByInstance = CreateIndex({
  name: Tokens_By_Instance,
  source: Tokens(),
  terms: [
    {
      field: ['instance']
    }
  ],
  unique: false,
  serialized: true
})

 /* Function Roles */

/* Roles can also be bound to a function, here we separate the permissions per function.
 * This is mainly for documentation purposes so you can see how roles work. If you feel like it, you could create one big role
 * for all your functions as well. Sometimes (e.g. when functions take delicate parameters) it would be useful though to separate
 * permissions per UDF function.
 * Below we create the Role that will be bound to the login function. It needs
 * to be able to:
 * - retrieve accounts by email
 * - be able to read the underlying accounts of that index
 * - create and read sessions, each login creates a session
 * - create tokens (we will create tokens manually for more flexibility instead of using the Login function)
 */
const CreateFnRoleLogin = (accountsByEmailIndex, accountsCollection, accountSessionCollection) => CreateOrUpdateRole({
  name: FunctionRole_Login,
  privileges: [
    {
      resource: accountsByEmailIndex,
      actions: { read: true }
    },
    {
      resource: accountsCollection,
      actions: { read: true }
    },
    {
      resource: accountSessionCollection,
      actions: { read: true, create: true }
    },
    {
      resource: Tokens(),
      actions: { create: true }
    }
  ]
})

/* The register role is not very special, it just needs to be able to create an account.
 * when your app becomes more complex, it could be that you want to do more than creating an account to
 * preconfigure a new user in your app when the register UDF is called. In that case, you would add extra permissions here.
 */
const CreateFnRoleRegister = (accountsCollection) => CreateOrUpdateRole({
  name: FunctionRole_Register,
  privileges: [
    {
      resource: accountsCollection,
      actions: { create: true }
    }
  ]
})

/* This role defines everything that the refresh_token and logout functions should be able to do
 * this are powerful permissions hence why we encapsulate these in a User Defined Function (UDF)
 */
const CreateFnRoleRefreshTokenLogout = (accountsCollection, accountSessionsCollection, accessTokensBySessionIndex, tokensByInstanceIndex, accountSessionsByAccountIndex) => CreateOrUpdateRole({
  name: FunctionRole_Refresh_Tokens_Logout,
  privileges: [
    {
      resource: accountsCollection,
      actions: { read: true }
    },
    {
      resource: accountSessionsCollection,
      actions: { read: true, create: true, write: true, delete: true }
    },
    {
      // We could limit this further but this is ok for now.
      // As the function can't be changed and takes no parameters.
      resource: Tokens(),
      actions: { read: true, create: true, delete: true }
    },
    {
      resource: accessTokensBySessionIndex,
      actions: { read: true }
    },
    {
      resource: tokensByInstanceIndex,
      actions: { read: true }
    },
    {
      resource: accountSessionsByAccountIndex,
      actions: { read: true }
    }
  ]
})

/* Functions */
const RegisterUDF = (registerFunctionRole) => CreateOrUpdateFunction({
  name: Register,
  body: Query(Lambda(['email', 'password', 'roles'], RegisterAccount(Var('email'), Var('password'), Var('roles')))),
  role: registerFunctionRole
})

const LoginUDF = (loginFunctionRole) => CreateOrUpdateFunction({
  name: Login,
  body: Query(Lambda(['email', 'password'], LoginAccount(Var('email'), Var('password')))),
  role: loginFunctionRole
})

const RefreshTokenUDF = (refreshTokenLogoutFunctionRole) => CreateOrUpdateFunction({
  name: Refresh_Token,
  body: Query(Lambda([], RefreshToken())),
  role: refreshTokenLogoutFunctionRole
})

const LogoutAllUDF = (refreshTokenLogoutFunctionRole) => CreateOrUpdateFunction({
  name: Logout_All,
  body: Query(Lambda([], LogoutAllSessions())),
  role: refreshTokenLogoutFunctionRole
})

const LogoutUDF = (refreshTokenLogoutFunctionRole) => CreateOrUpdateFunction({
  name: Logout,
  body: Query(Lambda([], LogoutCurrentSession())),
  role: refreshTokenLogoutFunctionRole
})

/* Membership Roles */

/* The refresh role is a membership role that will give access to something completely different than accounts.
 * Refresh tokens are linked to a 'session' document and will therefore have completely different permissions than
 * accounts.
 *
 * The only permissions we give such a refresh token is to call the 'refresh_token' UDF and one of the two
 * 'logout' UDFs. Obviously, a refresh token is powerful since it can create tokens for accounts. We
 * will therefore handle these with great care and store them in secure httpOnly cookies.
 *
 * We chose not to give a refresh token direct access to data though and there is a good reason.
 * - First an attacker that gets hold of a refresh token might not know how to use it. since that will allow us to verify whether refresh tokens might be
 *   stolen (of course, this is 'security by obscurity' which is not something you should rely on but it's not a bad idea to make it harder)
 * - If the only way to get access to data via a refresh token is to create an access token we can so some clever tricks
 *   to verify whether a refresh token hsa been leaked (authentication providers do these kind of things for you)
 */
const CreateRefreshMembershipRole = (accountSessionsCollection, refreshTokenFunction, logoutFunction, logoutAllFunction) => CreateOrUpdateRole({
  name: MembershipRole_Refresh_Logout,
  membership: [{ resource: accountSessionsCollection }],
  privileges: [
    {
      resource: refreshTokenFunction,
      actions: {
        call: true
      }
    },
    {
      resource: logoutFunction,
      actions: {
        call: true
      }
    },
    {
      resource: logoutAllFunction,
      actions: {
        call: true
      }
    }
  ]
})

async function createAccountCollection(client) {
  await client.query(
    Let([
      // Create Collections
      {
        accounts_collection: IfNotExists(Collection(Accounts), CreateAccountsCollection)
      },
      {
        account_sessions_collection: IfNotExists(Collection(Account_Sessions), CreateAccountsSessionRefreshCollection)
      },
      // Create Indexes
      {
        accounts_by_email_index: IfNotExists(Index(Accounts_By_Email), CreateIndexAccountsByEmail(
          Select(["ref"], Var("accounts_collection"))
        ))
      },
      {
        all_accounts_index: IfNotExists(Index(All_Accounts), CreateIndexAllAccounts(
          Select(["ref"], Var("accounts_collection"))
        ))
      },
      {
        access_tokens_by_sessions_index: IfNotExists(Index(Access_Tokens_By_Session), CreateIndexAccessTokensByRefreshTokens)
      },
      {
        session_by_account_index: IfNotExists(Index(Account_Sessions_By_Account), CreateIndexSessionByAccount(
          Select(["ref"], Var("account_sessions_collection"))
        ))
      },
      {
        tokens_by_instance_index: IfNotExists(Index(Tokens_By_Instance), CreateIndexTokensByInstance)
      },
      // Create Function Roles
      {
        login_function_role: CreateFnRoleLogin(
          Select(["ref"], Var("accounts_by_email_index")),
          Select(["ref"], Var("accounts_collection")),
          Select(["ref"], Var("account_sessions_collection")),
        ),
      },
      {
        register_function_role: CreateFnRoleRegister(
          Select(["ref"], Var("accounts_collection")),
        ),
      },
      {
        refresh_token_logout_function_role: CreateFnRoleRefreshTokenLogout(
          Select(["ref"], Var("accounts_collection")),
          Select(["ref"], Var("account_sessions_collection")),
          Select(["ref"], Var("access_tokens_by_sessions_index")),
          Select(["ref"], Var("tokens_by_instance_index")),
          Select(["ref"], Var("session_by_account_index")),
        ),
      },
      // Create Functions
      {
        login_function: LoginUDF(
          Select(["ref"], Var("login_function_role")),
        ),
      },
      {
        register_function: RegisterUDF(
          Select(["ref"], Var("register_function_role")),
        ),
      },
      {
        refresh_token_function: RefreshTokenUDF(
          Select(["ref"], Var("refresh_token_logout_function_role")),
        ),
      },
      {
        logout_all_function: LogoutAllUDF(
          Select(["ref"], Var("refresh_token_logout_function_role")),
        ),
      },
      {
        logout_function: LogoutUDF(
          Select(["ref"], Var("refresh_token_logout_function_role")),
        ),
      },
      {
        create_refresh_membership_role: CreateRefreshMembershipRole(
          Select(["ref"], Var("account_sessions_collection")),
          Select(["ref"], Var("refresh_token_function")),
          Select(["ref"], Var("logout_function")),
          Select(["ref"], Var("logout_all_function")),
        ),
      },
    ]
    ,{})
  )  
}

async function deleteAccountsCollection(client) {
  await client.query(DeleteIfExists(Collection(Accounts)))
  await client.query(DeleteIfExists(Collection(Account_Sessions)))
  await client.query(DeleteIfExists(Index(Accounts_By_Email)))
  await client.query(DeleteIfExists(Index(All_Accounts)))
  await client.query(DeleteIfExists(Index(Access_Tokens_By_Session)))
  await client.query(DeleteIfExists(Index(Account_Sessions_By_Account)))
  await client.query(DeleteIfExists(Index(Tokens_By_Instance)))
}

module.exports = { createAccountCollection, deleteAccountsCollection }
