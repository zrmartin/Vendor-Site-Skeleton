const faunadb = require('faunadb')

const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})



exports.handler = async (event, context, callback) => {
  console.log("Function `createProducts` invoked")
  try {
    let results = await client.query(
      q.Create(
        q.Collection("Products"),
        { data: {
            name: "Test Product",
            quantity: 100,
            price: 100
        }},
      )
    )

    return {
      statusCode: 200,
      body: JSON.stringify(results)
    }
  } 
  catch {
    console.log("Error creating new product", error)
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  }
}