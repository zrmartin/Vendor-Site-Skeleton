import { createAccountCollection } from './accounts.js'
import { handleSetupError } from '../helpers/errors.js'
import { executeFQL } from '../helpers/fql.js'
import { LoginUDF, RegisterUDF, RefreshTokenUDF, LogoutAllUDF, LogoutUDF } from './functions.js'
import faunadb from 'faunadb'

const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})
// *********** NOTE ************
/* BEFORE RUNNING YOU HAVE TO ADD:
      "type": "module",
    To package.json
*/

async function setupDatabase(client) {
  await handleSetupError(createAccountCollection(client), 'collections/indexes - accounts collection')

  // Define the functions we will use
  await executeFQL(client, LoginUDF, 'functions - login')
  await executeFQL(client, RegisterUDF, 'functions - register')
  await executeFQL(client, RefreshTokenUDF, 'functions - refresh')
  await executeFQL(client, LogoutAllUDF, 'functions - logout all')
  await executeFQL(client, LogoutUDF, 'functions - logout')
}

setupDatabase(client)

