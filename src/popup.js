// Import turbo
import '@hotwired/turbo'

import log from './log'

const updateReviewFields = (tabUrl, title) => {
  document.getElementById('review_submitted_url').value = tabUrl
  document.getElementById('review_citation_title').value = title
}

const displayLoginForm = () => {
  document.getElementById("login-form").classList.remove("hidden")
}

chrome.storage.local.remove("reviewKey")

// chrome.storage.local.set({"reviewKey": "xxxxxx"})

chrome.storage.local.get("reviewKey", function(data) {
  log.debug(data)
  if (typeof data !== undefined && data.reviewKey !== undefined) {
    window.reviewKey = data.reviewKey
  } else {
    // wow, I need to enqueue updates I guess - might be solved by putting JS at the end
    setTimeout(displayLoginForm, 100)
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  // since only one tab should be active and in the current window at once
  // the return variable should only have one entry
  const activeTab = tabs[0]
  // window.storedTabUrl = activeTab.url // this is available in updateReviewFields
  // log.debug(tabs[0])
  setTimeout(updateReviewFields, 500, activeTab.url, activeTab.title)
})

// Close the popup
// window.close()
