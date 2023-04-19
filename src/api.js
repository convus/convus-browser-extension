import log from './log' // eslint-disable-line

const requestProps = (ratingToken = false, extraProps = {}) => {
  const headers = { 'Content-Type': 'application/json' }
  if (ratingToken) {
    headers.Authorization = `Bearer ${ratingToken}`
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
const isRatingTokenValid = (authUrl, ratingToken) => new Promise((resolve, reject) => {
  const authStatusUrl = `${authUrl}/status`

  return fetch(authStatusUrl, requestProps(ratingToken, { method: 'GET' }))
    .then(response => response.json()
      .then((json) => {
        resolve(json.message !== 'missing user' && response.status === 200)
      })
    ).catch((e) => {
      resolve(errorResponse(e))
    })
})

const getRatingToken = (authUrl, loginFormData) => new Promise((resolve, reject) => {
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
          result.message = ['error', json.message]
        } else {
          result = { ratingToken: json.review_token, currentName: json.name, message: ['success', 'authenticated'] }
        }
        resolve(result)
      })
    ).catch((e) => {
      resolve(errorResponse(e))
    })
})

const submitRating = (ratingUrl, ratingToken, ratingFormData) => new Promise((resolve, reject) => {
  const rProps = requestProps(ratingToken, { body: ratingFormData })

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
  getRatingToken,
  isRatingTokenValid,
  requestProps,
  submitRating
}
