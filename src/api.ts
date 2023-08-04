import log from './log' // eslint-disable-line

function requestProps(authToken = '', extraProps = {}): object {
  const defaultProps = {
    method: 'POST',
    async: true,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken.length > 0) && { Authorization: `Bearer ${authToken}` }
    },
    contentType: 'json'
  }
  return { ...defaultProps, ...extraProps }
}

async function isAuthTokenValid(authUrl: string, authToken: string | undefined): Promise<boolean> {
  return await new Promise(async (resolve, _reject) => {
    const authStatusUrl = `${authUrl}/status`

    return await fetch(authStatusUrl, requestProps(authToken, { method: 'GET' }))
      .then(async (response) => await response.json()
        .then((json) => {
          resolve(json.message !== 'missing user' && response.status === 200)
        })
      ).catch((e) => {
        log.debug(errorResponse(e))
        resolve(false)
      })
  })
}

async function getAuthToken(authUrl: RequestInfo | URL, loginFormData: any) {
  return await new Promise(async (resolve, _reject) => {
    const rProps = {
      method: 'POST',
      async: true,
      headers: { 'Content-Type': 'application/json' },
      contentType: 'json',
      body: loginFormData
    }
    return await fetch(authUrl, rProps)
      .then(async (response) => await response.json()
        .then((json) => {
          resolve(responseFormatter(response, json))
        })
      ).catch((e) => {
        resolve(errorResponse(e))
      })
  })
}

function responseFormatter(authResponse: any, authJson: any) {
  if (authResponse.status !== 200 || typeof (authJson.review_token) === 'undefined' || authJson.review_token === null) {
    return { message: ['error', authJson.message] }
  } else {
    return { authToken: authJson.review_token, currentName: authJson.name, message: ['success', 'authenticated'] }
  }
}

async function postRating(ratingUrl: RequestInfo | URL, authToken: string | undefined, ratingFormData: any) {
  return await new Promise(async (resolve, _reject) => {
    const rProps = requestProps(authToken, { body: ratingFormData })

    return await fetch(ratingUrl, rProps)
      .then(async (response) => await response.json()
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
}

async function getRating(ratingUrl: RequestInfo | URL, authToken: string | undefined, url: string) {
  return await new Promise(async (resolve, _reject) => {
    const rProps = requestProps(authToken, { method: 'GET' })

    const getRatingUrl = `${ratingUrl}/for_url?url=${encodeURIComponent(url)}`
    log.trace('getRatingUrl', getRatingUrl)

    return await fetch(getRatingUrl, rProps)
      .then(async (response) => await response.json()
        .then((json) => {
          if (response.status === 200 && json.quality) {
            resolve({
              success: true,
              data: json
            })
          } else {
            resolve({ success: false, data: json })
          }
        })
      ).catch((e) => {
        resolve(errorResponse(e))
      })
  })
}

// Just return an error message that includes the error
function errorResponse(e: string) {
  return { success: false, message: ['error', `Error: ${e})`] }
}

export default {
  getAuthToken,
  isAuthTokenValid,
  requestProps, // Only exported for testing
  getRating,
  postRating
}
