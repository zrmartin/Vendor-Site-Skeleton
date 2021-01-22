const faunadb = require('faunadb')

const q = faunadb.query
const {
  Call
} = q
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})

exports.handler = async (event, context, callback) => {
  console.log("Function `identity-login` invoked")
  let email = event.body.user.email
  let password = process.env.SHOP_OWNER_PASSWORD

  try {
    let results = await client.query(
      Call(Function('login'), [email, password])
    )
    let body = JSON.stringify({
      user: results.user,
      secret: results.access.secret
    })
    return{
      statusCode: 200,
      headers: {
        "Set-Cookie": `refreshToken = ${results.refresh.secret};HttpOnly` // Add ;secure option when going to production 
      },
      body
    }
  }
  catch (error){
    console.log("Error logging in", error)
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  }
}