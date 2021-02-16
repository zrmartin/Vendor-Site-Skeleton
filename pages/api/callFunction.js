const faunadb = require('faunadb')
const q = faunadb.query
const { Call } = q

module.exports = async (req, res) => {
  let { accessToken, functionName, ...body } = req.body;
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
    res.json({
      body: results
    })
  } 
  catch (error) {
    console.log(`Error in 'Call Function - ${functionName}'`, error)
    res.status(error.requestResult.statusCode).json(error)
  }
}