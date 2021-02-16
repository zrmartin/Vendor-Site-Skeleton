import faunadb from 'faunadb'
import { getCookie } from '../../util/cookie'
const { FUNCTIONS: { Logout_All } } = require('../../util/constants/database/functions')
const q = faunadb.query
const { Call } = q

module.exports = async (req, res) => {
  console.log("Function `logout` invoked")
  const { cookie } = req.headers;
  const refreshToken = getCookie(cookie, "refreshToken")
  const client = new faunadb.Client({
    secret: refreshToken
  })

  try {
    let results = await client.query(
      Call(Logout_All)
    ) 
    res.setHeader("Set-Cookie", [`refreshToken=; HttpOnly; Max-Age=-1; Path=/;`])
    res.json({
      body: results
    })
  }
  catch (error){
    console.log("Error calling `logout_all` - ", error)
    res.status(error.requestResult.statusCode).json(error)
  }
}