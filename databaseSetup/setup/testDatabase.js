import { v4 as uuidv4 } from 'uuid'
import { query, Client } from 'faunadb'
const { CreateDatabase, CreateKey, Database, Delete, Do, Call } = query
const { createAccountCollection } = require('./accounts')
const { createShopsCollection } = require('./shops')
const { createProductsCollection } = require('./products')
const { createImagesCollection } = require('./images')
const { handleSetupError } = require('../helpers/errors')
const { FUNCTIONS: { Login, Register }} = require('../../util/constants/database/functions')

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
  await handleSetupError(createShopsCollection(client), 'collections/indexes - shops collection')
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

export async function createTestUserAndClient(adminClient, email, password, roles) {
  const registerBody ={
    email,
    password,
    roles
  }
  const user = await adminClient.query(
    Do(
      Call(Register, [registerBody]),
      Call(Login, [email, password])
    )

  )
  return new Client({
    secret: user.access.secret
  })
}



