import log from './log' // eslint-disable-line

const requestProps = (reviewToken, extraProps = {}) => {
  const defaultProps = {
    async: true,
    headers: {
      Authorization: 'Bearer ' + reviewToken,
      'Content-Type': 'application/json'
    },
    contentType: 'json'
  }
  return { ...defaultProps, ...extraProps }
}

const verifyReviewTokenValid = (reviewToken, authUrl) => new Promise((resolve, reject) => {
  const authStatusUrl = `${authUrl}/status`

  return fetch(authStatusUrl, requestProps(reviewToken, { method: 'GET' }))
    .then(response => response.json()
      .then((json) => {
        resolve(json.message !== 'missing user' && response.status === 200)
      })
    ).catch((e) => {
      reject(e)
    })
})

const getReviewToken = (loginFormData, authUrl) => new Promise((resolve, reject) => {
  const authProps = {method: 'POST',
    async: true,
    headers: {'Content-Type': 'application/json'},
    contentType: 'json',
    body: loginFormData
  }
  return fetch(authUrl, authProps)
    .then(response => response.json()
      .then((json) => {
        if (typeof (json.review_token) === 'undefined' || json.review_token === null) {
          resolve(json)
        } else {
          resolve({reviewToken: json.review_token})
        }
      })
    ).catch((e) => {
      reject(e)
    })
})

export default {
  requestProps,
  getReviewToken,
  verifyReviewTokenValid
}
