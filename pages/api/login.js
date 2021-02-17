const { SITE_CONTEXT, SITE_CONTEXTS } = require("../../util/constants/siteContexts")
const { HTTP_CODES: { Bad_Request } } = require("../../util/constants/httpCodes")
const { FUNCTIONS: { Login } } = require('../../util/constants/database/functions')
import faunadb from 'faunadb'

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
  now.setTime(now.getTime() + 60*60*1000*8)
  const includeSecure = SITE_CONTEXT == SITE_CONTEXTS.PROD ? "Secure" : ""

  try {
    let results = await client.query(
      Call(Login, [email, password])
    ) 
    if (!results.access || !results.refresh || !results.account) {
      res.status(Bad_Request).json({
        message: "Invalid Credentials"
      })
    }
    else {
      res.setHeader("Set-Cookie", [`refreshToken=${results.refresh.secret}; HttpOnly; Expires=${now.toUTCString()}; Path=/; ${includeSecure}`])
      res.json({
        body: {
          account: results.account,
          secret: results.access.secret
        }
      })
    }
  }
  catch (error){
    console.log("Error calling `login` - ", error)
    res.status(error.requestResult.statusCode).json(error)
  }
}