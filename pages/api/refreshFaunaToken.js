const faunadb = require('faunadb')
const { getCookie } = require('../../util/cookie')
const { FUNCTIONS: { Refresh_Token } } = require('../../util/constants/database/functions')
const q = faunadb.query
const { Call } = q

module.exports = async (req, res) => {
  console.log("Function `refreshFaunaToken` invoked")
  const { cookie } = req.headers;
  const refreshToken = getCookie(cookie, "refreshToken")
  const client = new faunadb.Client({
    secret: refreshToken
  })

  try {
    let results = await client.query(
      Call(Refresh_Token)
    ) 

    res.json({
      body: {
        secret: results.access.secret,
        account: results.account,
      }
    })
  }
  catch (error){
    console.log("Error calling `refreshFaunaToken` - ", error)
    res.status(error.requestResult.statusCode).json(error)
  }
}