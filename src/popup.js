import log from './log' // eslint-disable-line
import login from './login'
import rating from './rating'

// Oh Chrome, it would be great if you used `browser` instead of `chrome`
if (process.env.browser_target == 'chrome') { browser = chrome } // eslint-disable-line

browser.storage.local.get(['ratingToken', 'currentName'])
  .then(data => {
    if (typeof (data.ratingToken) === 'undefined' || data.ratingToken === null) {
      login.loginTime()
    } else {
      window.ratingToken = data.ratingToken
      window.currentName = data.currentName
      rating.ratingTime()
      login.checkAuthToken(data.ratingToken)
    }
  })

browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  // since only one tab should be active and in the current window at once
  // the return variable should only have one entry
  const activeTab = tabs[0]
  // window.storedTabUrl = activeTab.url // this is available in updateRatingFields
  // log.debug(tabs[0])
  // log.debug(activeTab)
  rating.updateRatingFields(activeTab.url, activeTab.title)
})
