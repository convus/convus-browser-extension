import log from './log' // eslint-disable-line
import login from './login'
import rating from './rating'

// Oh Chrome, it would be great if you used `browser` instead of `chrome`
if (process.env.browser_target == 'chrome') { browser = chrome } // eslint-disable-line

browser.storage.local.get(['authToken', 'currentName'])
  .then(data => {
    if (typeof (data.authToken) === 'undefined' || data.authToken === null) {
      login.loginTime()
    } else {
      window.authToken = data.authToken
      window.currentName = data.currentName
      rating.ratingTime()
      login.checkAuthToken(data.authToken)
    }
  })

const checkAuthUrl = (url) => { return `${process.env.baseUrl}/browser_extension_auth` === url }

// function coolPageScript(pageUrl) {
//   // if (pageUrl === "https://www.convus.org/browser_extension_auth") {
//   if (pageUrl === "http://localhost:3009/browser_extension_auth") {
//     // el = document.getElementById('apiToken').textContent
//     // console.log(el)
//     const authInfo = {apiToken: window.apiToken, username: window.username}
//     // console.log(authInfo)
//     return JSON.stringify(authInfo)
//     // return "asdfadsf" // JSON.stringify({apiToken: window.apiToken, username: window.username})
//   } else {
//     return JSON.stringify({metadata: "asdfasd"})
//   }
//   // return JSON.stringify({metadata: "asdfasd"})
// }

const authInfo = () => {
  info = document.getElementById('new_user')?.getAttribute('action')
  log.debug(info)
  return {ratingToken: log.info, username: window.username}
}

// NOTE: the function that's passed into executeScript must be self contained -
//       it can't reference other things (e.g. other functions here)
const metaAttributes = (isAuthUrl = false) => {
  // Convert an Attr to a [name, value] pair
  const attrToPair = (attr) => [attr.name, attr.value]
  // Convert an element to an object of its attributes, {key: value, ...}.
  const elToAttrs = (el) => Object.fromEntries(Array.from(el.attributes).map(attrToPair))
  // Convert an iterable of elements to a list of element attributes
  const elsToAttrs = (els) => Array.from(els).map(elToAttrs)

  elements = isAuthUrl ? document.querySelectorAll('meta[name="ext-token"], meta[name="ext-username"]') : document.getElementsByTagName('meta')
  return elsToAttrs(elements)
}

const getCurrentTab = async function () {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  // log.debug(tab)
  rating.updateRatingFields(tab.url, tab.title)

  // log.debug(tab.url)

  const isAuthUrl = checkAuthUrl(tab.url)
  // log.debug(isAuthUrl)

  const response = await browser.scripting.executeScript({
    target: { tabId: tab.id },
    function: metaAttributes,
    args: [isAuthUrl]
  })

  // log.debug(response)
  log.debug(response[0].result)
  if (isAuthUrl) {
    log.debug("Login party!")
  }
}

// const getResponse = async function (tabId) {
//   log.debug(`tab id: ${tabId}`)
//   const response = await browser.tabs.sendMessage(tabId, {greeting: "hello"})
//   log.debug(response)
// }

getCurrentTab()

// async function browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   // since only one tab should be active and in the current window at once
//   // the return variable should only have one entry
//   const activeTab = tabs[0]
//   // window.storedTabUrl = activeTab.url // this is available in updateRatingFields
//   // log.debug(activeTab)
//   rating.updateRatingFields(activeTab.url, activeTab.title)
//   log.debug(tabs[0])
// })

// (async () => {
//   const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
//   const response = await chrome.tabs.sendMessage(tab.id, {greeting: "hello"});
//   // do something with response here, not outside the function
//   console.log(response);
// })();
