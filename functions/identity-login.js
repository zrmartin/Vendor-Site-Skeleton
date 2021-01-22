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
  // These log statements can only be seen on netlify UI for some reason
  // Grab event.user.email and password from .env file. Use these to call login from fauna db.
  console.log("Function `identity-login` invoked")
  console.log(event.user.email)
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