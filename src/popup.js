import '@hotwired/turbo'

import log from './log'

const updateReviewFields = (tabUrl, title) => {
  document.getElementById('review_submitted_url').value = tabUrl
  document.getElementById('review_citation_title').value = title
}

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const activeTab = tabs[0]
  setTimeout(updateReviewFields, 500, activeTab.url, activeTab.title)
})
