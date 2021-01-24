const faunadb = require('faunadb')
const { getCookie } = require('../util/cookie')
const q = faunadb.query
const {
  Call
} = q

exports.handler = async (event, context) => {
  console.log("Function `logout` invoked")
  const { cookie } = event.headers;
  const refreshToken = getCookie(cookie, "refreshToken")
  const client = new faunadb.Client({
    secret: refreshToken
  })

  try {
    let results = await client.query(
      Call('logout_all')
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
    console.log("Error calling `login` - ", error)
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  }
}