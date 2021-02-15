// Need to create FaunaDB USer
// I think user will be logged in? Should I try to create access/refresh tokens?
const faunadb = require('faunadb')

const { COLLECTIONS: { Accounts } } = require('../../util/constants/database/collections')

const q = faunadb.query
const {
  Create,
  Collection
} = q
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})

exports.handler = async (event, context) => {
  console.log("Function `identity-signup` invoked")
  const data = event.body;
  const { user } = data;

  const responseBody = {
    app_metadata: {
      roles: ["owner"]
    },
    user_metadata: {
      ...user.user_metadata, // append current user metadata
    }
  };

  try {
    let results = await client.query(Create(
      Collection(Accounts),
      {
        data: {
          email: user.email
        },
        credentials: {
          password: process.env.SHOP_OWNER_PASSWORD
        }
      }
    ));

    return {
      statusCode: 200,
      body: JSON.stringify(responseBody)
    }
  } 
  catch (error) {
    console.log("Error calling `identity-signup` - ", error)
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  }
}