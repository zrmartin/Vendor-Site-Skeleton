const { createAccountCollection } = require('./accounts')
const { createProductsCollection } = require('./products')
const { createImagesCollection } = require('./images')
const { handleSetupError } = require('../helpers/errors')
const faunadb = require('faunadb')

const client = new faunadb.Client({
  secret: ""
})

export async function setupDatabase(client) {
  await handleSetupError(createAccountCollection(client), 'collections/indexes - accounts collection')
  await handleSetupError(createProductsCollection(client), 'collections/indexes - products collection')
  await handleSetupError(createImagesCollection(client), 'collections/indexes - images collection')
}

setupDatabase(client)

