import log from './log'
import api from './api'

chrome.storage.local.get('reviewKey')
  .then(data => data.reviewKey)
  .then(reviewKey => {
    if (typeof (reviewKey) === 'undefined' || reviewKey === null) {
      loginTime()
    } else {
      // window.reviewKey = reviewKey
      verifyReviewKey(window.reviewKey)
    }
  })

// const setReviewPageData =
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  // since only one tab should be active and in the current window at once
  // the return variable should only have one entry
  const activeTab = tabs[0]
  // window.storedTabUrl = activeTab.url // this is available in updateReviewFields
  // log.debug(tabs[0])
  updateReviewFields(activeTab.url, activeTab.title)
})

// getStoredReviewKey()
// setReviewPageData()

// Close the popup
// window.close()

const verifyReviewKey = (key) => {
  log.debug('checking review key:', key)
  const authUrl = formAuthUrl()
  // rerun after pause rerun if DOM hasn't loaded
  if (typeof (authUrl) === 'undefined' || authUrl === null) {
    log.debug('authUrl not present in DOM, trying later')
    return setTimeout(verifyReviewKey, 50, key)
  }
  log.debug(authUrl, formNewReviewUrl())

}

const updateReviewFields = (tabUrl, title) => {
  // rerun after pause rerun if DOM hasn't loaded
  const reviewUrlField = document.getElementById('review_submitted_url')
  if (typeof (reviewUrlField) === 'undefined' || reviewUrlField === null) {
    log.debug('authUrl not present in DOM, trying later')
    return setTimeout(reviewUrlField, 50, tabUrl, title)
  }
  reviewUrlField.value = tabUrl
  document.getElementById('review_citation_title').value = title
}

const formAuthUrl = () => document.getElementById('new_user')?.getAttribute('action')
const formNewReviewUrl = () => document.getElementById('new_review_form')?.getAttribute('action')

const loginTime = () => {
  log.debug("it's login time")
  // rerun after pause rerun if DOM hasn't loaded
  const loginForm = document.getElementById('login-form')
  if (typeof (loginForm) === 'undefined' || loginForm === null) {
    log.debug('login form not present in DOM, trying later')
    return setTimeout(loginTime, 50)
  }
  // Remove the existing data that is incorrect - maybe actually do in form submit?
  // chrome.storage.local.remove("reviewKey")
  window.reviewKey = undefined
  loginForm?.classList.remove('hidden')
  document.getElementById('new_review')?.classList?.add('hidden')
}

// chrome.storage.local.remove("reviewKey")
chrome.storage.local.set({"reviewKey": "xxxxxx"})
