const faunadb = require('faunadb')

const q = faunadb.query

exports.handler = async (event, context) => {
  console.log("Function `createProducts` invoked")
  const { accessToken } = JSON.parse(event.body);
  const client = new faunadb.Client({
    secret: accessToken
  })

  try {
    let results = await client.query(
      q.Create(
        q.Collection("Products"),
        { data: {
            name: "Test Product",
            quantity: 112,
            price: 123
        }},
      )
    )

    return {
      statusCode: 200,
      body: JSON.stringify({
        ...results,
        accessToken: accessToken
      })
    }
  } 
  catch (error) {
    console.log("Error creating new product", error)
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  }
}