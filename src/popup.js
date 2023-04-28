import log from './log' // eslint-disable-line
import login from './login'
import rating from './rating'

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

  if (login.isSignInOrUpUrl(window.currentUrl)) {
    // If the user is signing in/up to Convus, don't inject a script
    log.debug('Viewing Convus sign in or up')
    return
  } else if (!isAuthUrl) {
    // Update rating fields that we have info for, the metadata can be added later
    rating.updateRatingFields(window.currentUrl, tab.title)
  }

  browser.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['/injected_script.js']
  })
    .then(response => {
      // log.debug('Script response: ', response)
      const result = response[0].result
      if (isAuthUrl) {
        login.loginFromAuthPageData(result.authToken, result.currentName)
      } else {
        rating.addMetadata(result)
      }
    })
}

getCurrentTab()
