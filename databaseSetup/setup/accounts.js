const { DeleteIfExists, IfNotExists } = require('../helpers/fql')
const { COLLECTIONS: { Accounts, Account_Sessions } } = require('../../util/constants/collections')
const { INDEXES: { All_Accounts, Accounts_By_Email, Access_Tokens_By_Session, Account_Sessions_By_Account, Tokens_By_Instance }} = require('../../util/constants/indexes')

const faunadb = require('faunadb')
const q = faunadb.query
const { CreateCollection, CreateIndex, Collection, Index, Tokens } = q

/* Collection */

const CreateAccountsCollection = CreateCollection({ name: Accounts })

/* Indexes */
const CreateIndexAllAccounts = CreateIndex({
  name: All_Accounts,
  source: Collection(Accounts),
  // this is the default collection index, no terms or values are provided
  // which means the index will sort by reference and return only the reference.
  serialized: true
})

const CreateIndexAccountsByEmail = CreateIndex({
  name: Accounts_By_Email,
  source: Collection(Accounts),
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

const CreateAccountsSessionRefreshCollection = CreateCollection({ name: Account_Sessions })

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

const CreateIndexSessionByAccount = CreateIndex({
  name: Account_Sessions_By_Account,
  source: Collection(Account_Sessions),
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

async function createAccountCollection(client) {
  const accountsRes = await client.query(IfNotExists(Collection(Accounts), CreateAccountsCollection))
  await client.query(IfNotExists(Collection(Account_Sessions), CreateAccountsSessionRefreshCollection))
  await client.query(IfNotExists(Index(Accounts_By_Email), CreateIndexAccountsByEmail))
  await client.query(IfNotExists(Index(All_Accounts), CreateIndexAllAccounts))
  await client.query(IfNotExists(Index(Access_Tokens_By_Session), CreateIndexAccessTokensByRefreshTokens))
  await client.query(IfNotExists(Index(Account_Sessions_By_Account), CreateIndexSessionByAccount))
  await client.query(IfNotExists(Index(Tokens_By_Instance), CreateIndexTokensByInstance))
  return accountsRes
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
