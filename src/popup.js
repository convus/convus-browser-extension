import log from './log'

chrome.storage.local.get("reviewKey")
  .then(data => data.reviewKey)
  .then(reviewKey => {
    if (typeof reviewKey !== undefined) {
      window.reviewKey = reviewKey
      checkReviewKey(window.reviewKey)
    } else {
      loginTime()
    }
  })

// const setReviewPageData =
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  // since only one tab should be active and in the current window at once
  // the return variable should only have one entry
  const activeTab = tabs[0]
  // window.storedTabUrl = activeTab.url // this is available in updateReviewFields
  // log.debug(tabs[0])
  setTimeout(updateReviewFields, 500, activeTab.url, activeTab.title)
})

// getStoredReviewKey()
// setReviewPageData()

// Close the popup
// window.close()

const checkReviewKey = (key) => {
  log.debug("checking review key:", key)
  authUrl = formAuthUrl()
  if (typeof(authUrl) === 'undefined' || authUrl === null) {
    log.debug("authUrl not present, trying later")
    return setTimeout(checkReviewKey, 50, key)
  }
  log.debug(authUrl)
}

const updateReviewFields = (tabUrl, title) => {
  document.getElementById('review_submitted_url').value = tabUrl
  document.getElementById('review_citation_title').value = title
}

const formAuthUrl = () => document.getElementById('new_user')?.getAttribute("action")
const formNewReviewUrl = () => document.getElementById('new_review_form')?.getAttribute("action")
// method: 'GET',
// const fetchProperties = (reviewKey) => {
//   {method: 'POST',
//     async: true,
//     headers: {
//       Authorization: 'Bearer ' + reviewKey,
//       'Content-Type': 'application/json'
//     },
//     'contentType': 'json'
//   }

const loginTime = () => {
  log.debug("it's login time")
  let loginForm = document.getElementById("login-form")
  if  (typeof(loginForm) === 'undefined' || loginForm === null) {
    log.debug("login form not present, trying later")
    return setTimeout(loginTime, 50)
  }
  // Remove the existing data that is incorrect - maybe actually do in form submit?
  // chrome.storage.local.remove("reviewKey")
  window.reviewKey = undefined
  loginForm?.classList.remove("hidden")
  document.getElementById("new_review")?.classList?.add("hidden")
}

// chrome.storage.local.remove("reviewKey")
// chrome.storage.local.set({"reviewKey": "xxxxxx"})
