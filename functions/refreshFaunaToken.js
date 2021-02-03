const faunadb = require('faunadb')
const { getCookie } = require('../util/cookie')
const { FUNCTIONS: { Refresh_Token } } = require('../util/constants/database/functions')
const q = faunadb.query
const { Call } = q

exports.handler = async (event, context) => {
  console.log("Function `refreshFaunaToken` invoked")

  // Set expire time for 8 hours in the future.
  const { cookie } = event.headers;
  const refreshToken = getCookie(cookie, "refreshToken")
  const client = new faunadb.Client({
    secret: refreshToken
  })

  try {
    let results = await client.query(
      Call(Refresh_Token)
    ) 
    let body = JSON.stringify({
      secret: results.access.secret
    })
    return{
      statusCode: 200,
      body
    }
  }
  catch (error){
    console.log("Error calling `refreshFaunaToken` - ", error)
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  }
}