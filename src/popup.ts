import log from './log' // eslint-disable-line
import login from './login'
import rating from './rating'
import injectedScript from './injected_script'
// TODO: only import renderAlerts
import utilities from './utilities'

// instantiating these outside functions prevents a periodic "process is undefined" bug
// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
const browserTarget = process.env.browser_target
const safariType = !!browserTarget.match('safari') // match safari and safari_ios

// Oh Chrome, it would be great if you used `browser` instead of `chrome`
// @ts-expect-error TS(2304): Cannot find name 'browser'.
if (browserTarget == 'chrome') { browser = chrome } // eslint-disable-line

// @ts-expect-error TS(2304): Cannot find name 'browser'.
browser.storage.local.get(['authToken', 'currentName'])
  .then((data: any) => {
    if (typeof (data.authToken) === 'undefined' || data.authToken === null) {
      log.debug(`missing auth!   authToken: ${data.authToken} and currentName: ${data.currentName}`)
      login.loginTime()
    } else {
      log.trace('auth present')
      // @ts-expect-error TS(2339): Property 'authToken' does not exist on type 'Windo... Remove this comment to see the full error message
      window.authToken = data.authToken
      // @ts-expect-error TS(2339): Property 'currentName' does not exist on type 'Win... Remove this comment to see the full error message
      window.currentName = data.currentName
      login.checkAuthToken(data.authToken)
    }
  })

const handlePageData = (response: any, isAuthUrl: any) => {
  log.debug('Script response: ', response)

  const result = safariType ? response[0] : response[0]?.result
  log.warn(`result: ${JSON.stringify(result)}`)
  if (isAuthUrl) {
    // @ts-expect-error TS(2339): Property 'currentUrl' does not exist on type 'Wind... Remove this comment to see the full error message
    log.trace(`authUrl?: ${isAuthUrl}    ${window.currentUrl}`)
    login.loginFromAuthPageData(result.authToken, result.currentName)
  } else {
    rating.addMetadata(result)
  }
}

const injectScript = async function (tabId: any, isAuthUrl: any) {
  // @ts-expect-error TS(2304): Cannot find name 'browser'.
  await browser.scripting.executeScript({
    target: { tabId: tabId },
    func: injectedScript
  })
    .then((response: any) => {
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
        // @ts-expect-error TS(2339): Property 'authToken' does not exist on type 'Windo... Remove this comment to see the full error message
        if (!window.authToken) { login.fallbackLoginTime() }
      }
    })
}

const getCurrentTab = async function () {
  // @ts-expect-error TS(2304): Cannot find name 'browser'.
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  log.trace(tab)

  // Assign these things to window so they can be accessed other places
  // @ts-expect-error TS(2339): Property 'currentUrl' does not exist on type 'Wind... Remove this comment to see the full error message
  window.currentUrl = tab.url
  // @ts-expect-error TS(2339): Property 'currentUrl' does not exist on type 'Wind... Remove this comment to see the full error message
  const isAuthUrl = login.isAuthUrl(window.currentUrl)
  // @ts-expect-error TS(2339): Property 'tabId' does not exist on type 'Window & ... Remove this comment to see the full error message
  window.tabId = tab.id

  // @ts-expect-error TS(2339): Property 'currentUrl' does not exist on type 'Wind... Remove this comment to see the full error message
  if (login.isSignInOrUpUrl(window.currentUrl)) {
    // If the user is signing in/up to Convus, don't inject a script
    log.debug('Viewing Convus sign in or up')
    return
  } else if (!isAuthUrl) {
    // Update rating fields that we have info for, the metadata can be added later
    // @ts-expect-error TS(2339): Property 'currentUrl' does not exist on type 'Wind... Remove this comment to see the full error message
    rating.updateRatingFields(window.currentUrl, tab.title)
  }
  // @ts-expect-error TS(2339): Property 'tabId' does not exist on type 'Window & ... Remove this comment to see the full error message
  injectScript(window.tabId, isAuthUrl)
}

getCurrentTab()