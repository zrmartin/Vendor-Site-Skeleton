const { createAccountCollection } = require('./accounts')
const { createProductsCollection } = require('./products')
const { createImagesCollection } = require('./images')
const { handleSetupError } = require('../helpers/errors')
const { executeFQL } = require('../helpers/fql')
const { LoginUDF, RegisterUDF, RefreshTokenUDF, LogoutAllUDF, LogoutUDF } = require('./functions')
const { CreateFnRoleLogin, CreateFnRoleRegister, CreateFnRoleRefreshTokens, CreateRefreshRole } = require('./roles')
const faunadb = require('faunadb')

const client = new faunadb.Client({
  secret: ""
})

async function setupDatabase(client) {
  await handleSetupError(createAccountCollection(client), 'collections/indexes - accounts collection')
  await handleSetupError(createProductsCollection(client), 'collections/indexes - products collection')
  await handleSetupError(createImagesCollection(client), 'collections/indexes - images collection')

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

