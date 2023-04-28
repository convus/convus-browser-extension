import log from './log' // eslint-disable-line
import login from './login'
import rating from './rating'
import injectedScript from './injected_script'

// instantiating these outside functions prevents a periodic "process is undefined" bug
const browserTarget = process.env.browser_target
const safariType = !!browserTarget.match('safari') // get safari_ios too

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
  const isAuthUrl = login.isAuthUrl(window.currentUrl)
  window.tabId = tab.id

  if (login.isSignInOrUpUrl(window.currentUrl)) {
    // If the user is signing in/up to Convus, don't inject a script
    log.debug('Viewing Convus sign in or up')
    return
  } else if (!isAuthUrl) {
    // Update rating fields that we have info for, the metadata can be added later
    rating.updateRatingFields(window.currentUrl, tab.title)
  }

  await browser.scripting.executeScript({
    target: { tabId: tab.id },
    func: injectedScript
  })
    .then(response => {
      log.debug('Script response: ', response)
      const result = safariType ? response[0] : response[0].result
      if (isAuthUrl) {
        log.debug(`authUrl?: ${isAuthUrl}    ${window.currentUrl}`)
        log.debug(`result: ${JSON.stringify(result)}`)
        login.loginFromAuthPageData(result.authToken, result.currentName)
      } else {
        rating.addMetadata(result)
      }
    })
}

getCurrentTab()
