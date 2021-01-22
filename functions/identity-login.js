// Need to create access token, send back and store in memory
// Need to set refresh toekn as http only cookie
/*EX:     
return {
      headers: {
        "Set-Cookie": refreshToken = res.refresh.secret ;HttpOnly ;Secure (if not dev, need HTTPS);   
        "Content-Type": "application/json",
      }
    }
    */
   // Need to create FaunaDB USer
// I think user will be logged in? Should I try to create access/refresh tokens?
const faunadb = require('faunadb')

const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})

exports.handler = async (event, context, callback) => {
  console.log("Function `identity-login` invoked")
  console.log(context)
  console.log(event)
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({context})
    }
  } 
  catch {
    console.log("Error logging in", error)
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  }
}