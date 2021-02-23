import { v4 as uuidv4 } from 'uuid'
import { query, Client } from 'faunadb'
const { CreateDatabase, CreateKey, Database, Delete, Do, Call } = query
const { createAccountCollection } = require('./accounts')
const { createProductsCollection } = require('./products')
const { createImagesCollection } = require('./images')
const { handleSetupError } = require('../helpers/errors')
const { FUNCTIONS: { Login, Register, Create_Product }} = require('../../util/constants/database/functions')

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

export async function createTestUserAndClient(adminClient) {
  const user = await adminClient.query(
    Do(
      Call(Register, ["test@test.com", "password"]),
      Call(Login, ["test@test.com", "password"])
    )

  )
  return new Client({
    secret: user.access.secret
  })
}



