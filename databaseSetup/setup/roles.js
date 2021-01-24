import { CreateOrUpdateRole } from './../helpers/fql.js'
import faunadb from 'faunadb'
const q = faunadb.query
const { Collection, Index, Tokens, Query, Lambda, Not, Equals, Select, Get, Var } = q


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
const CreateFnRoleLogin = CreateOrUpdateRole({
  name: 'functionrole_login',
  privileges: [
    {
      resource: Index('accounts_by_email'),
      actions: { read: true }
    },
    {
      resource: Collection('accounts'),
      actions: { read: true }
    },
    {
      resource: Collection('account_sessions'),
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
const CreateFnRoleRegister = CreateOrUpdateRole({
  name: 'functionrole_register',
  privileges: [
    {
      resource: Collection('accounts'),
      actions: { create: true }
    }
  ]
})


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

const CreateRefreshRole = CreateOrUpdateRole({
  name: 'membership_role_refresh_logout',
  membership: [{ resource: Collection('account_sessions') }],
  privileges: [
    {
      resource: q.Function('refresh_token'),
      actions: {
        call: true
      }
    },
    {
      resource: q.Function('logout'),
      actions: {
        call: true
      }
    },
    {
      resource: q.Function('logout_all'),
      actions: {
        call: true
      }
    }
  ]
})

/* This role defines everything that the refresh_token and logout functions should be able to do
 * this are powerful permissions hence why we encapsulate these in a User Defined Function (UDF)
 */

const CreateFnRoleRefreshTokens = CreateOrUpdateRole({
  name: 'functionrole_refresh_tokens_logout',
  privileges: [
    {
      resource: Collection('accounts'),
      actions: { read: true }
    },
    {
      resource: Collection('account_sessions'),
      actions: { read: true, create: true, write: true, delete: true }
    },
    {
      // We could limit this further but this is ok for now.
      // As the function can't be changed and takes no parameters.
      resource: Tokens(),
      actions: { read: true, create: true, delete: true }
    },
    {
      resource: Index('access_tokens_by_session'),
      actions: { read: true }
    },
    {
      resource: Index('tokens_by_instance'),
      actions: { read: true }
    },
    {
      resource: Index('account_sessions_by_account'),
      actions: { read: true }
    }
  ]
})

export {
  CreateFnRoleLogin,
  CreateRefreshRole,
  CreateFnRoleRegister,
  CreateFnRoleRefreshTokens
}
