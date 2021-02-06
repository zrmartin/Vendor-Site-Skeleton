const { HTTP_CODES: { Validation_Error }} = require('../util/constants/httpCodes')

async function getNetlifyToken() {
  const currentUser = netlifyIdentity.currentUser()
  if (!currentUser) {
    return ''
  }
  // fetchs new netlify JWT token only if expired
  await currentUser.jwt()
  return currentUser.token.access_token
}

async function getFaunaToken(accessToken) {
  if (accessToken) {
    return accessToken
  }
  // TODO error handle if this fails
  // If this fails, refresh token is not valid and user needs to log in again
  var response = await fetch(`/.netlify/functions/refreshFaunaToken`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
  })
  var results = await response.json()

  return results.secret
}

export async function GET(api) {
  const netlifyToken = await getNetlifyToken()
  var results = await fetch(`/.netlify/functions/${api}`, {
    headers: { Authorization: `Bearer ${netlifyToken}` }
  })

  return await results.json()
}

export async function POST(api, body) {
  const netlifyToken = await getNetlifyToken()

  var response = await fetch(`/.netlify/functions/${api}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${netlifyToken}`
    },
    body: JSON.stringify(body)
  })

  return await response.json()
}

export async function CALL_FAUNA_FUNCTION(functionName, accessToken, setAccessToken, schema = null, body = {}) {
  if (schema) {
    try {
      await schema.validate(body)
      body = schema.cast(body)
    }
    catch (e) {
      return {
        code: Validation_Error,
        message: e.message
      }
    }
  }

  const netlifyToken = await getNetlifyToken()
  accessToken = await getFaunaToken(accessToken)
  setAccessToken(accessToken)
  body = {
    ...body,
    accessToken,
    functionName
  }

  var response = await fetch(`/.netlify/functions/callFunction`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${netlifyToken}`
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    let info = await response.json()
    console.log(info)
    // Error message from database error. I.E No permissions to perform database action (update/delete etc)
    let errorMessage = info?.requestResult?.responseContent?.errors[0]?.cause[0]?.description
    const error = new Error()

    if (errorMessage) {
      error.message = errorMessage
    }
    else {
      error.message = 'An error occurred while contacting the server'
    }

    // Attach extra info to the error object.
    error.info = info
    error.status = response.status  
    throw error
  }

  return await response.json()
}