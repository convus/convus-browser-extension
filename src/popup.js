import log from './log' // eslint-disable-line
import login from './login'
import rating from './rating'
import injectedScript from './injected_script'

// instantiating these outside functions prevents a periodic "process is undefined" bug
const browserTarget = process.env.browser_target

// Oh Chrome, it would be great if you used `browser` instead of `chrome`
if (browserTarget == 'chrome') { browser = chrome } // eslint-disable-line

browser.storage.local.get(['authToken', 'currentName'])
  .then(data => {
    if (typeof (data.authToken) === 'undefined' || data.authToken === null) {
      log.debug(`missing auth!   authToken: ${data.authToken} and currentName: ${data.currentName}`)
      login.loginTime()
    } else {
      log.trace('auth present')
      window.authToken = data.authToken
      window.currentName = data.currentName
      login.checkAuthToken(data.authToken)
    }
  })

const getCurrentTab = async function () {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  // log.debug(tab)

  // Assign these things to window so they can be accessed other places
  window.currentUrl = tab.url
  const isAuthUrl = login.isAuthUrl(tab.url)
  window.tabId = tab.id

  // Update rating fields that we have info for, the metadata can be added later
  if (!isAuthUrl) { rating.updateRatingFields(tab.url, tab.title) }

  // const response = await browser.scripting.executeScript({
  // files: ["injected_scripts.js"]
  browser.scripting.executeScript({
    target: { tabId: tab.id },
    function: injectedScript
  }).then(response => {
    log.debug(`Script response: ${response}`)
    const result = response[0].result
    if (isAuthUrl) {
      login.loginFromAuthPageData(result.authToken, result.currentName)
    } else {
      rating.addMetadata(result)
    }
  })
}

getCurrentTab()
