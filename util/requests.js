const { HTTP_CODES: { Validation_Error }} = require('../util/constants/httpCodes')
const { VERCEL_FUNCTIONS: { Call_Function, Refresh_Fauna_Token }} = require('../util/constants/vercelFunctions')

export async function getAccessTokenAndAccount() {
  var response = await fetch(`/api/${Refresh_Fauna_Token}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
  })
  if (!response.ok) {
    const error = new Error()
    error.message = 'Your session has expired, please login again'
    throw error
  }
  return (await response.json()).body
}

export async function GET(api) {
  var response = await fetch(`/api/${api}`)

  if (!response.ok) {
    let info = await response.json()
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

  return (await response.json()).body
}

export async function POST(api, body) {
  var response = await fetch(`/api/${api}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    let info = await response.json()
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

  return (await response.json()).body
}

export async function CALL_FAUNA_FUNCTION(functionName, accessToken, schema = null, body = {}) {
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

  body = {
    ...body,
    accessToken,
    functionName
  }

  var response = await fetch(`/api/${Call_Function}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    let info = await response.json()

    // Error message from database error. I.E No permissions to perform database action (update/delete etc)
    let errorMessage = info?.requestResult?.responseContent?.errors?.[0].cause?.[0].description
    const error = new Error()

    if (errorMessage) {
      error.message = errorMessage
    }
    else {
      error.message = info.message
    }

    error.status = info.requestResult?.statusCode  
    throw error
  }

  return (await response.json()).body
}