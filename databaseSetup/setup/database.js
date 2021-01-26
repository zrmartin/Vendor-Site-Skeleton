import { createAccountCollection } from './accounts.js'
import { createProductsCollection, deleteProductsCollection } from './products.js'
import { handleSetupError } from '../helpers/errors.js'
import { executeFQL } from '../helpers/fql.js'
import { LoginUDF, RegisterUDF, RefreshTokenUDF, LogoutAllUDF, LogoutUDF } from './functions.js'
import faunadb from 'faunadb'

import {
  CreateFnRoleLogin,
  CreateFnRoleRegister,
  CreateFnRoleRefreshTokens,
  CreateRefreshRole
} from './roles.js'

const client = new faunadb.Client({
  secret: ""
})
// *********** NOTE ************
/* BEFORE RUNNING YOU HAVE TO ADD:
      "type": "module",
    To package.json
*/

async function setupDatabase(client) {
  await handleSetupError(createAccountCollection(client), 'collections/indexes - accounts collection')
  await handleSetupError(createProductsCollection(client), 'collections/indexes - products collection')

  /* Setup User Auth Objects*/
  // Before we define functions we need to define the roles that will be assigned to them.
  await executeFQL(client, CreateFnRoleLogin, 'roles - function role - login')
  await executeFQL(client, CreateFnRoleRegister, 'roles - function role - register')
  await executeFQL(client, CreateFnRoleRefreshTokens, 'roles - function role - refresh')

  // Define the functions we will use
  await executeFQL(client, LoginUDF, 'functions - login')
  await executeFQL(client, RegisterUDF, 'functions - register')
  await executeFQL(client, RefreshTokenUDF, 'functions - refresh')
  await executeFQL(client, LogoutAllUDF, 'functions - logout all')
  await executeFQL(client, LogoutUDF, 'functions - logout')

  // Finally the membership role will give logged in Accounts (literally members from the Accounts collection)
  // access to the protected data.
  await executeFQL(client, CreateRefreshRole, 'roles - membership role - refresh')
}

setupDatabase(client)

