const { SITE_CONTEXT, SITE_CONTEXTS } = require("../../util/constants/siteContexts")
const { HTTP_CODES: { Bad_Request } } = require("../../util/constants/httpCodes")
const { FUNCTIONS: { Register } } = require('../../util/constants/database/functions')
import faunadb from 'faunadb'

const q = faunadb.query
const { Call } = q
const client = new faunadb.Client({
  secret: process.env.NEXT_PUBLIC_FAUNADB_SECRET
})

module.exports = async (req, res) => {
  console.log("Function `register` invoked")
  const { email, password, roles } = req.body;

  try {
    let results = await client.query(
      Call(Register, [email, password, roles])
    )
    res.json({
      body: results
    })
  }
  catch (error){
    console.log("Error calling `register` - ", error)
    res.status(error.requestResult.statusCode).json(error)
  }
}