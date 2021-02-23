const handleSetupError = (promise, explanation) => {
  return promise
    .then(data => {
      return data
    })
}

const safeVerifyError = (error, keys) => {
  if (keys.length > 0) {
    if (error && error[keys[0]]) {
      const newError = error[keys[0]]
      keys.shift()
      return safeVerifyError(newError, keys)
    } else {
      return false
    }
  }
  return error
}

const refreshTokenUsed = 'refresh_token_used'

module.exports = { handleSetupError, safeVerifyError, refreshTokenUsed }
