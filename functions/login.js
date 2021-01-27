const { SITE_CONTEXT, SITE_CONTEXTS } = require("../util/constants/siteContexts")
const { FUNCTIONS: { Login } } = require('../util/constants/functions')
const faunadb = require('faunadb')

const q = faunadb.query
const { Call } = q
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})


exports.handler = async (event, context) => {
  console.log("Function `login` invoked")
  const { user } = context.clientContext;
  let email = user.email
  let password = process.env.SHOP_OWNER_PASSWORD
  // Set expire time for 8 hours in the future.
  let now = new Date()
  now.setTime(now.getTime() + 60*60*1000*8)
  const includeSecure = SITE_CONTEXT == SITE_CONTEXTS.PROD ? "Secure" : ""

  try {
    let results = await client.query(
      Call(Login, [email, password])
    ) 
    let body = JSON.stringify({
      user: results.user,
      secret: results.access.secret
    })
    return{
      statusCode: 200,
      headers: {
        "Set-Cookie": `refreshToken=${results.refresh.secret}; HttpOnly; Expires=${now.toUTCString()}; Path=/; ${includeSecure}`
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