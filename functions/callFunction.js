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