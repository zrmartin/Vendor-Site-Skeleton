const faunadb = require('faunadb')

const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})

exports.handler = async (event, context) => {
  console.log("Function `getProducts` invoked")
  try {
    let results = await client.query(q.Map(
      q.Paginate(q.Match(q.Index("all_products"))),
      q.Lambda("product", q.Get(q.Var("product")))
    ));

    return {
      statusCode: 200,
      body: JSON.stringify(results)
    }
  } 
  catch {
    console.log("Error fetching all products", error)
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  }
}