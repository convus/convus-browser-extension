import log from './log' // eslint-disable-line
import login from './login'
import rating from './rating'
import injected_scripts from './injected_scripts'

// instantiating these outside functions prevents a periodic "process is undefined" bug
const browserTarget = process.env.browser_target
const baseUrl = process.env.baseUrl

// Oh Chrome, it would be great if you used `browser` instead of `chrome`
if (browserTarget == 'chrome') { browser = chrome } // eslint-disable-line

browser.storage.local.get(['authToken', 'currentName'])
  .then(data => {
    log.debug(`got authToken: ${data.authToken} and currentName: ${data.currentName}`)

    if (typeof (data.authToken) === 'undefined' || data.authToken === null) {
      login.loginTime()
    } else {
      window.authToken = data.authToken
      window.currentName = data.currentName
      // rating.ratingTime() // not sure, might still want this?
      login.checkAuthToken(data.authToken)
    }
  })

const checkAuthUrl = (url) => { return `${baseUrl}/browser_extension_auth` === url }

const getCurrentTab = async function () {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  // log.debug(tab)

  const isAuthUrl = checkAuthUrl(tab.url)

  // Update rating fields that we have info for, the metadata can be added later
  if (!isAuthUrl) { rating.updateRatingFields(tab.url, tab.title) }

  const response = await browser.scripting.executeScript({
    target: { tabId: tab.id },
    function: injected_scripts.metaAttributes,
    args: [isAuthUrl]
  })

  // log.debug(response)
  const result = response[0].result
  if (isAuthUrl) {
    login.authPageSuccess(injected_scripts.resultToAuthData(result))
  } else {

  }
}

getCurrentTab()
