import { v4 as uuidv4 } from 'uuid'
import { query, Client } from 'faunadb'
const { CreateDatabase, CreateKey, Database, Delete, Do, Call } = query
const { createAccountCollection } = require('./accounts')
const { createProductsCollection } = require('./products')
const { createImagesCollection } = require('./images')
const { handleSetupError } = require('../helpers/errors')


export async function createChildDatabase() {
  const testDatabaseName = uuidv4()
  const adminClient = new Client({
    secret: process.env.NEXT_PUBLIC_FAUNADB_SECRET
  })

  const databaseRef = await adminClient.query(
    CreateDatabase({ name: testDatabaseName })
  )

  const testDatabaseKey = await adminClient.query(
    CreateKey({
      database: Database(testDatabaseName),
      role: 'admin',
    })
  )

  return {
    key: testDatabaseKey,
    databaseRef: databaseRef.ref,
  }
}

export async function setupDatabase(client) {
  await handleSetupError(createAccountCollection(client), 'collections/indexes - accounts collection')
  await handleSetupError(createProductsCollection(client), 'collections/indexes - products collection')
  await handleSetupError(createImagesCollection(client), 'collections/indexes - images collection')

  // Create test user
  await client.query(
    Call("register", ["test@test.com","password"])
  )

  const user = await client.query(
    Call("login", ["test@test.com","password"])
  )

  return new Client({
    secret: user.access.secret
  })
}

export async function destroyDatabase(databaseInfo) {
  const adminClient = new Client({
    secret: process.env.NEXT_PUBLIC_FAUNADB_SECRET
  })

  await adminClient.query(
    Do(
      Delete(databaseInfo.databaseRef),
      Delete(databaseInfo.key.ref)
    )
  )
}



