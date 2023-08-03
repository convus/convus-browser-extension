// import log from './log' // eslint-disable-line

const requestProps = (authToken = false, extraProps = {}) => {
  const headers = { 'Content-Type': 'application/json' }
  if (authToken) {
    // @ts-expect-error TS(2339): Property 'Authorization' does not exist on type '{... Remove this comment to see the full error message
    headers.Authorization = `Bearer ${authToken}`
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
const isAuthTokenValid = (authUrl: any, authToken: any) => new Promise((resolve, reject) => {
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

const getAuthToken = (authUrl: any, loginFormData: any) => new Promise((resolve, reject) => {
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
        let result = {}
        if (response.status !== 200 || typeof (json.review_token) === 'undefined' || json.review_token === null) {
          // @ts-expect-error TS(2339): Property 'message' does not exist on type '{}'.
          result.message = ['error', json.message]
        } else {
          result = { authToken: json.review_token, currentName: json.name, message: ['success', 'authenticated'] }
        }
        resolve(result)
      })
    ).catch((e) => {
      resolve(errorResponse(e))
    })
})

const submitRating = (ratingUrl: any, authToken: any, ratingFormData: any) => new Promise((resolve, reject) => {
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
const errorResponse = (e: any) => {
  return { success: false, message: ['error', `Error: ${e})`] }
}

export default {
  getAuthToken,
  isAuthTokenValid,
  requestProps, // Only exported for testing
  submitRating
}
