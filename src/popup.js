// Import turbo
import '@hotwired/turbo'

import log from './log'

const updateReviewFields = (tabUrl, title) => {
  log.debug(window.storedTabUrl) // This works!
  document.getElementById('review_submitted_url').value = tabUrl
  document.getElementById('review_citation_title').value = title
}

// const function getTitle(){
//   return document.querySelector('title').textContent
// }
// lastFocused might be right sometime?
// chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  // since only one tab should be active and in the current window at once
  // the return variable should only have one entry
  // const activeTab = tabs[0];
  const tabUrl = tabs[0].url
  window.storedTabUrl = tabUrl
  // TODO: make this get the actual title
  log.debug(tabs[0])
  const title = tabs[0].title

  setTimeout(updateReviewFields, 500, tabUrl, title)

  // return tabUrl

  // Doesn't work :/
  // let result;
  // try {
  //   [{result}] = await chrome.scripting.executeScript({
  //     target: {tabId: tabs[0].id},
  //     func: () => ,
  //   });
  // } catch (e) {
  //   document.body.textContent = 'Cannot access page';
  //   return;
  // }
  // console.log(result)
})
