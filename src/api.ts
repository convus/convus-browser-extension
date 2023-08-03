import log from './log' // eslint-disable-line

const requestProps = (authToken = "", extraProps = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken.length > 0) && { 'Authorization': `Bearer ${authToken}` }
  }

  const defaultProps = {
    method: 'POST', // because default to some method
    async: true,
    headers: headers,
    contentType: 'json'
  }
  return { ...defaultProps, ...extraProps }
}

// Returns true/false
const isAuthTokenValid = (authUrl, authToken) => new Promise((resolve, reject) => {
  const authStatusUrl = `${authUrl}/status`

  return fetch(authStatusUrl, requestProps(authToken, { method: 'GET' }))
    .then(response => response.json()
      .then((json) => {
        resolve(json.message !== 'missing user' && response.status === 200)
      })
    ).catch((e) => {
      resolve(errorResponse(e))
    })
})

const getAuthToken = (authUrl, loginFormData) => new Promise((resolve, reject) => {
  const rProps = {
    method: 'POST',
    async: true,
    headers: { 'Content-Type': 'application/json' },
    contentType: 'json',
    body: loginFormData
  }
  return fetch(authUrl, rProps)
    .then(response => response.json()
      .then((json) => {
        resolve(responseFormatter(response, json))
      })
    ).catch((e) => {
      resolve(errorResponse(e))
    })
})

const responseFormatter = (authResponse: any, authJson: any) => {
  if (authResponse.status !== 200 || typeof (authJson.review_token) === 'undefined' || authJson.review_token === null) {
    return { message: ['error', authJson.message] }
  } else {
    return { authToken: authJson.review_token, currentName: authJson.name, message: ['success', 'authenticated'] }
  }
}

const submitRating = (ratingUrl, authToken, ratingFormData) => new Promise((resolve, reject) => {
  const rProps = requestProps(authToken, { body: ratingFormData })

  return fetch(ratingUrl, rProps)
    .then(response => response.json()
      .then((json) => {
        if (response.status === 200) {
          resolve({
            success: true,
            message: ['success', json.message],
            share: json.share
          })
        } else {
          resolve({ success: false, message: ['error', json.message] })
        }
      })
    ).catch((e) => {
      resolve(errorResponse(e))
    })
})

// Just return an error message that includes the error
const errorResponse = (e) => {
  return { success: false, message: ['error', `Error: ${e})`] }
}

export default {
  getAuthToken,
  isAuthTokenValid,
  requestProps, // Only exported for testing
  submitRating
}
