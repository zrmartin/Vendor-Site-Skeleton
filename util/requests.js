const { HTTP_CODES: { Validation_Error }} = require('../util/constants/httpCodes')
const { VERCEL_FUNCTIONS: { Call_Function }} = require('../util/constants/vercelFunctions')

export async function GET(api) {
  var response = await fetch(`/api/${api}`)

  if (!response.ok) {
    const info = await response.json()
    const error = createError(info)
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
    const info = await response.json()
    const error = createError(info)
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
    const info = await response.json()
    const error = createError(info)
    throw error
  }

  return (await response.json()).body
}


const createError = (info) => {
  const error = new Error()

  // Error message from database error. I.E No permissions to perform database action (update/delete etc)
  let errorMessage = info?.requestResult?.responseContent?.errors?.[0].cause?.[0].description

  if (errorMessage) {
    error.message = errorMessage
  }
  else {
    error.message = info.message
  }

  error.status = info.requestResult?.statusCode
  return error  
}