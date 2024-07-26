import log from './log' // eslint-disable-line
import login from './login'
import rating from './rating'
import injectedScript from './injected_script'
// TODO: only import renderAlerts
import utilities from './utilities'

// instantiating these outside functions prevents a periodic "process is undefined" bug
const browserTarget = process.env.browser_target
const safariType = !!browserTarget.match('safari') // match safari and safari_ios

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
      // TODO: include the URL here, so that we only need to make one request
      // HOWEVER! the url isn't available yet. Not sure the best approach
      login.checkAuthToken(data.authToken)
    }
  })

const handlePageData = (response, isAuthUrl) => {
  log.debug('Script response: ', response)

  const result = safariType ? response[0] : response[0]?.result
  log.warn(`result: ${JSON.stringify(result)}`)
  if (isAuthUrl) {
    log.trace(`authUrl?: ${isAuthUrl}    ${window.currentUrl}`)
    login.loginFromAuthPageData(result.authToken, result.currentName)
  } else {
    rating.addMetadata(result)
  }
}

const injectScript = async function (tabId, isAuthUrl) {
  await browser.scripting.executeScript({
    target: { tabId: tabId },
    func: injectedScript
  })
    .then(response => {
      try {
        handlePageData(response, isAuthUrl)
      } catch (e) {
        log.debug(e)
        let alert = [['warning', 'Unable to parse the page.']]
        if (safariType) {
          alert = [['error', 'Please upgrade to the most recent version Safari']]
        }
        utilities.renderAlerts(alert)
        // If there isn't an auth token, show login form
        if (!window.authToken) { login.fallbackLoginTime() }
      }
    })
}

const getCurrentTab = async function () {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  log.trace(tab)

  // Assign these things to window so they can be accessed other places
  window.currentUrl = tab.url
  const isAuthUrl = login.isAuthUrl(window.currentUrl)
  window.tabId = tab.id
  // When both of these values are true, the form updates on every change
  window.ratingDataLoaded = false
  window.metadataLoaded = false

  if (login.isSignInOrUpUrl(window.currentUrl)) {
    // If the user is signing in/up to Convus, don't inject a script
    log.debug('Viewing Convus sign in or up')
    return
  } else if (!isAuthUrl) {
    // Update rating fields that we have info for, the metadata can be added later
    rating.updateBasicRatingFields(window.currentUrl, tab.title)
    rating.loadRemoteRatingData(window.currentUrl)
  }
  injectScript(window.tabId, isAuthUrl)
}

getCurrentTab()
