/*
  ------------ NOTE ------------
  The order of the parameters passed into the body must match the order of parameters on the faunadb function.
  I.E If the fauna db function is expecting "name" and "price" passed into the lambda,
  then the object you have to pass to this function call must look like
  {
    name: "some name",
    price: "some price"
  }
  OR
  {
    1: "some name",
    2: "some price"
  }
  OR
  {
    2: "some price",
    1: "some name"
  }

  Either use all text based key values, then they will appear in the same chronological order.
  Or 
  Use all integer key values and they will appear in ascending key value

  Returned Results has a data shape of:
  {
    accessToken: "some_token"
    data: the data returned from the function call
  }
*/

const faunadb = require('faunadb')
const q = faunadb.query
const { Call } = q

exports.handler = async (event, context) => {
  let { accessToken, functionName, ...body } = JSON.parse(event.body);
  console.log(`Function 'Call Function - ${functionName}' invoked`)

  const client = new faunadb.Client({
    secret: accessToken
  })
  // If no params are passed, set body to empty Array because Fauana Function is expecting 0 Lamabda Params
  if (Object.keys(body).length === 0) {
    body = []
  }
  try {
    let results = await client.query(
      Call(functionName, body)
    ) 
  
    // Extract one layer of data.data nesting for when list of objects is returned
    if (Array.isArray(results?.data?.data)) {
      results.data = results.data.data
    }
    return {
      statusCode: 200,
      body: JSON.stringify(results)
    }
  } 
  catch (error) {
    console.log(`Error in 'Call Function - ${functionName}'`, error)
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  }
}