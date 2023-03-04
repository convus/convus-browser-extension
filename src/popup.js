// Import turbo
// import '@hotwired/turbo'

import log from './log'

const updateReviewFields = (tabUrl, title) => {
  document.getElementById('review_submitted_url').value = tabUrl
  document.getElementById('review_citation_title').value = title
}

const loginTime = () => {
  log.debug("it's login time")
  let loginForm = document.getElementById("login-form")
  if  (typeof(loginForm) === 'undefined' || loginForm === null) {
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

chrome.storage.local.get("reviewKey")
  .then(data => data.reviewKey)
  .then(reviewKey => {
    log.debug("reviewKey:", reviewKey)
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
}
