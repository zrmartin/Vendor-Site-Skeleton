const { executeFQL } = require('../helpers/fql')
const faunadb = require('faunadb')
const q = faunadb.query
const {
  If,
  Exists,
  Database,
  Filter,
  Delete,
  Lambda,
  Paginate,
  Var,
  Roles,
  Functions,
  Keys,
  Tokens,
  Indexes,
  Collections,
  Equals,
  Select,
  Get
} = q

const client = new faunadb.Client({
  secret: ""
})

const main = async () => {
    const DeleteAllRoles = q.Map(Paginate(Roles()), Lambda('ref', Delete(Var('ref'))))
    const DeleteAllFunctions = q.Map(Paginate(Functions()), Lambda('ref', Delete(Var('ref'))))
    const DeleteAllCollections = q.Map(Paginate(Collections()), Lambda('ref', Delete(Var('ref'))))
    const DeleteAllIndexes = q.Map(Paginate(Indexes()), Lambda('ref', Delete(Var('ref'))))
    const DeleteAllTokens = q.Map(Paginate(Tokens()), Lambda('ref', Delete(Var('ref'))))
    await executeFQL(client, DeleteAllRoles, 'database - delete roles')
    await executeFQL(client, DeleteAllFunctions, 'database - delete functions')
    await executeFQL(client, DeleteAllCollections, 'database - delete collections')
    await executeFQL(client, DeleteAllIndexes, 'database - delete indexes')
    await executeFQL(client, DeleteAllTokens, 'database - delete tokens')

    // Note, we don't delete keys since that would invalidate our admin key each time.
}

main()
