const { SITE_CONTEXT, SITE_CONTEXTS } = require("../../util/constants/siteContexts")
const { FUNCTIONS: { Login } } = require('../../util/constants/database/functions')
const faunadb = require('faunadb')

const q = faunadb.query
const { Call } = q
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})

module.exports = async (req, res) => {
  console.log("Function `login` invoked")
  const { email, password } = req.body;
  // Set expire time for 8 hours in the future.
  let now = new Date()
  now.setTime(now.getTime() + 30*1000)
  const includeSecure = SITE_CONTEXT == SITE_CONTEXTS.PROD ? "Secure" : ""

  try {
    let results = await client.query(
      Call(Login, [email, password])
    ) 

    res.setHeader("Set-Cookie", [`refreshToken=${results.refresh.secret}; HttpOnly; Expires=${now.toUTCString()}; Path=/; ${includeSecure}`])
    res.json({
      statusCode: 200,
      headers: {
        
      },
      body: {
        account: results.account,
        secret: results.access.secret
      }
    })
  }
  catch (error){
    console.log("Error calling `login` - ", error)
    res.status(error.requestResult.statusCode).json(error)
  }
}