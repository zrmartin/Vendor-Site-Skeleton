const faunadb = require('faunadb')
const { getCookie } = require('../util/cookie')
const { FUNCTIONS: { Logout_All } } = require('../util/constants/database/functions')
const q = faunadb.query
const { Call } = q

exports.handler = async (event, context) => {
  console.log("Function `logout` invoked")
  const { cookie } = event.headers;
  const refreshToken = getCookie(cookie, "refreshToken")
  const client = new faunadb.Client({
    secret: refreshToken
  })

  try {
    let results = await client.query(
      Call(Logout_All)
    ) 
    let body = JSON.stringify(results)
    return{
      statusCode: 200,
      headers: {
        "Set-Cookie": `refreshToken=; HttpOnly; Max-Age=-1; Path=/;`
      },
      body
    }
  }
  catch (error){
    console.log("Error calling `logout_all` - ", error)
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  }
}