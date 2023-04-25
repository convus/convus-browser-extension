import log from './log' // eslint-disable-line
import login from './login'
import rating from './rating'

// instantiating these outside functions prevents a periodic "process is undefined" bug
const browserTarget = process.env.browser_target
const baseUrl = process.env.baseUrl

// Oh Chrome, it would be great if you used `browser` instead of `chrome`
if (browserTarget == 'chrome') { browser = chrome } // eslint-disable-line

browser.storage.local.get(['authToken', 'currentName'])
  .then(data => {
    log.debug(`got authToken: ${data.authToken} and currentName: ${data.currentName}`)

    if (typeof (data.authToken) === 'undefined' || data.authToken === null) {
      log.debug('in localstorage get authtoken > undefined')
      login.loginTime()
    } else {
      window.authToken = data.authToken
      window.currentName = data.currentName
      rating.ratingTime()
      login.checkAuthToken(data.authToken)
    }
  })

const checkAuthUrl = (url) => { return `${baseUrl}/browser_extension_auth` === url }

// NOTE: the function that's passed into executeScript must be self contained -
//       it can't reference other things (e.g. other functions here)
const metaAttributes = (isAuthUrl = false) => {
  // Convert an Attr to a [name, value] pair
  const attrToPair = (attr) => [attr.name, attr.value]
  // Convert an element to an object of its attributes, {key: value, ...}.
  const elToAttrs = (el) => Object.fromEntries(Array.from(el.attributes).map(attrToPair))
  // Convert an iterable of elements to a list of element attributes
  const elsToAttrs = (els) => Array.from(els).map(elToAttrs)

  const elements = isAuthUrl ? document.querySelectorAll('meta[name="ext-token"], meta[name="ext-username"]') : document.getElementsByTagName('meta')
  return elsToAttrs(elements)
}

// Takes the metAttributes response from isAuthUrl, returns {currentName: currentName, authToken: authToken}
const resultToAuthData = (arr) => {
  const metaKey = (name) => name === 'ext-username' ? 'currentName' : 'authToken'
  const keypairs = arr.map(el => [metaKey(el.name), el.content])
  return Object.fromEntries(keypairs)
}

const getCurrentTab = async function () {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  // log.debug(tab)
  rating.updateRatingFields(tab.url, tab.title)

  const isAuthUrl = checkAuthUrl(tab.url)
  const response = await browser.scripting.executeScript({
    target: { tabId: tab.id },
    function: metaAttributes,
    args: [isAuthUrl]
  })

  // log.debug(response)
  const result = response[0].result
  if (isAuthUrl) {
    login.authPageSuccess(resultToAuthData(result))
  }
}

getCurrentTab()
