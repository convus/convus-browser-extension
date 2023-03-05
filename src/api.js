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
// method: 'GET'
// method: 'POST'

const verifyReviewTokenValid = (reviewToken, authUrl) => new Promise((resolve, reject) => {
  const authStatusUrl = `${authUrl}/status`

  return fetch(authStatusUrl, requestProps(reviewToken, { method: 'GET' }))
    .then(response => response.json()
      .then((json) => {
        resolve(json.message !== "missing user" && response.status == 200)
      })
      ).catch((e) => {
        reject(e)
    })
})

// async function verifyReviewTokenValid(reviewToken, authUrl) {
//   const authStatusUrl = `${authUrl}/status`

//   return new fetch(authStatusUrl, requestProps(reviewToken))
// }

export default {
  requestProps,
  verifyReviewTokenValid
}
