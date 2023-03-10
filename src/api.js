const requestProps = (reviewToken = false, extraProps = {}) => {
  const headers = { 'Content-Type': 'application/json' }
  if (reviewToken) {
    headers.Authorization = `Bearer ${reviewToken}`
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
const isReviewTokenValid = (authUrl, reviewToken) => new Promise((resolve, reject) => {
  const authStatusUrl = `${authUrl}/status`

  return fetch(authStatusUrl, requestProps(reviewToken, { method: 'GET' }))
    .then(response => response.json()
      .then((json) => {
        resolve(json.message !== 'missing user' && response.status === 200)
      })
    ).catch((e) => {
      resolve(errorResponse(e))
    })
})

const getReviewToken = (authUrl, loginFormData) => new Promise((resolve, reject) => {
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
          result = { reviewToken: json.review_token, message: ['success', 'authenticated'] }
        }
        resolve(result)
      })
    ).catch((e) => {
      resolve(errorResponse(e))
    })
})

const submitReview = (reviewUrl, reviewToken, reviewFormData) => new Promise((resolve, reject) => {
  const rProps = requestProps(reviewToken, { body: reviewFormData })

  return fetch(reviewUrl, rProps)
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
  getReviewToken,
  isReviewTokenValid,
  requestProps,
  submitReview
}
