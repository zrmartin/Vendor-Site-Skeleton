const faunadb = require('faunadb')

const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})

exports.handler = (event, context, callback) => {
  console.log("Function `getProducts` invoked")
  return client.query(q.Map(
    q.Paginate(
      q.Match(q.Index("all_products"))
    ),
    q.Lambda("X", q.Get(q.Var("X")))
  ))
  .then((response) => {
    return {
      statusCode: 200,
      body: JSON.stringify(response)
    }
  }).catch((error) => {
    console.log("Error fetching all products", error)
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  })
}
