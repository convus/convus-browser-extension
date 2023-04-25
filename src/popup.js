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


function coolPageScript(pageUrl) {
  // if (pageUrl === "https://www.convus.org/browser_extension_auth") {
  if (pageUrl === "http://localhost:3009/browser_extension_auth") {
    // el = document.getElementById('apiToken').textContent
    // console.log(el)
    const authInfo = {apiToken: window.apiToken, username: window.username}
    // console.log(authInfo)
    return JSON.stringify(authInfo)
    // return "asdfadsf" // JSON.stringify({apiToken: window.apiToken, username: window.username})
  } else {
    return JSON.stringify({metadata: "asdfasd"})
  }
  // return JSON.stringify({metadata: "asdfasd"})
}

const getCurrentTab = async function () {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  // log.debug(tab)
  rating.updateRatingFields(tab.url, tab.title)
  response = await browser.scripting.executeScript({
    // browser.scripting.executeScript({
    target: {tabId: tab.id},
    function: coolPageScript,
    args: [tab.url]
  })
  // .then((a) =>
  //   console.log(a)
  //   console.log("fasdfasdf"))

  log.debug(response)
  result = JSON.parse(response[0].result)
  log.debug(result)
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
