import log from './log' // eslint-disable-line
import login from './login'
import rating from './rating'
// import injectedScripts from './injected_scripts'

// instantiating these outside functions prevents a periodic "process is undefined" bug
const browserTarget = process.env.browser_target
const baseUrl = process.env.baseUrl

// Oh Chrome, it would be great if you used `browser` instead of `chrome`
if (browserTarget == 'chrome') { browser = chrome } // eslint-disable-line

log.debug("--------")

browser.storage.local.get(['authToken', 'currentName'])
  .then(data => {
    if (typeof (data.authToken) === 'undefined' || data.authToken === null) {
      log.debug(`missing auth!   authToken: ${data.authToken} and currentName: ${data.currentName}`)
      login.loginTime()
    } else {
      log.debug(`auth present`)
      window.authToken = data.authToken
      window.currentName = data.currentName
      login.checkAuthToken(data.authToken)
    }
  })

const getPageData = (isAuthUrl = false) => {
  // If it's auth data, we only care about the two auth meta fields
  if (isAuthUrl) {
    const authData = {
      currentName: document.querySelector('meta[name="ext-username"]')?.content,
      authToken: document.querySelector('meta[name="ext-token"]')?.content
    }
    return authData
  }
  // Convert an Attr to a [name, value] pair
  const attrToPair = (attr) => [attr.name, attr.value]
  // Convert an element to an object of its attributes, {key: value, ...}.
  const elToAttrs = (el) => Object.fromEntries(Array.from(el.attributes).map(attrToPair))
  // Convert an iterable of elements to a list of element attributes
  const elsToAttrs = (els) => Array.from(els).map(elToAttrs)

  const countWords = (str) => str.trim().split(/\s+/).length

  // document.addEventListener("DOMContentLoaded", function(event) {
  let metadataAttrs = elsToAttrs(document.getElementsByTagName('meta'))
  const wordCount = { word_count: countWords(document.body.textContent) }

  // Add jsonLD - don't parse here, in case malformed
  const jsonLD = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((i) => i.innerText.trim())
  if (jsonLD.length) {
    metadataAttrs = metadataAttrs.concat([{ json_ld: jsonLD }])
  }
  return metadataAttrs.concat([wordCount])
  // }
}

const checkAuthUrl = (url) => `${baseUrl}/browser_extension_auth` === url

log.debug("000000")
const getCurrentTab = async function () {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  // log.debug(tab)

  // Assign these things to window so they can be accessed other places
  window.onAuthUrl = checkAuthUrl(tab.url)
  window.tabId = tab.id

  // Update rating fields that we have info for, the metadata can be added later
  if (!window.onAuthUrl) { rating.updateRatingFields(tab.url, tab.title) }
  log.debug("kkkkkkkk")
  // const response = await browser.scripting.executeScript({
  browser.scripting.executeScript({
    target: { tabId: tab.id },
    function: getPageData,
    args: [window.onAuthUrl]
  }).then(response => {
    log.debug(`CCCCCCC ${response}`)
    const result = response[0].result

    if (window.onAuthUrl) {
      login.authPageSuccess(result.authToken, result.currentName)
    } else {
      rating.addMetadata(result)
    }
  })
}

getCurrentTab()
