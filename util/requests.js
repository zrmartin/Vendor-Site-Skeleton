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
    console.log("Access Token pass from frontend")
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

export async function POST_SECURE(api, body, accessToken) {
  const netlifyToken = await getNetlifyToken()
  accessToken = await getFaunaToken(accessToken)
  body = {
    ...body,
    accessToken: accessToken
  }
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