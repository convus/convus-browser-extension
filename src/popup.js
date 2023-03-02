// Import turbo
import '@hotwired/turbo'

import log from './log'

const updateReviewFields = (tabUrl) => {
  log.debug(window.storedTabUrl) // This works!
  let reviewUrlField = document.getElementById("review_submitted_url")
  // log.debug(reviewUrlField)
  reviewUrlField.value = tabUrl;
}
// lastFocused might be right sometime?
// chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  // since only one tab should be active and in the current window at once
  // the return variable should only have one entry
  // const activeTab = tabs[0];
  const tabUrl = tabs[0].url
  window.storedTabUrl = tabUrl

  setTimeout(updateReviewFields, 500, tabUrl)

  return tabUrl
});



// log.debug(document.getElementById("review_submitted_url"))

// document.addEventListener('turbo:load', () => {
//   let reviewUrlField = document.getElementById("review_submitted_url")
//   log.debug(reviewUrlField)
//   reviewUrlField.value = window.tabUrl;
// })

// log.debug(tabUrl)
