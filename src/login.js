import log from './log' // eslint-disable-line
import api from './api'
import utilities from './utilities'

// Internal
const baseUrl = process.env.baseUrl
const formAuthUrl = baseUrl + '/api/v1/auth'

// Internal
const storeAuthData = ({ authToken, currentName }) => {
  // TODO, there has to be a better way to handle passing the arguments
  browser.storage.local.set({ authToken: authToken, currentName: currentName })
  window.authToken = authToken
  window.currentName = currentName
}

// Internal
const removeAuthData = () => {
  browser.storage.local.remove('authToken')
  browser.storage.local.remove('currentName')
  window.authToken = undefined
}

const checkAuthToken = async function (token) {
  if (utilities.retryIfMissing(formAuthUrl, checkAuthToken, token)) { return }

  const result = await api.isAuthTokenValid(formAuthUrl, token)
  log.debug('auth token check success:', result)
  if (result) { return }
  // Remove the existing data that is incorrect - maybe actually do in form submit?
  removeAuthData()
  loginTime()
}

const authPageSuccess = ({ authToken, currentName }) => {
  utilities.hideAlerts()
  storeAuthData({ authToken: authToken, currentName: currentName })
  // in case we're already showing the "sign in to auth" message
  utilities.elementsHide('.spinners, #new_rating, #whitespace-preserver')
  utilities.elementsShow('#auth_message_in')

  window.closeTabFunction = (event = false) => {
    event && event.preventDefault()
    chrome.tabs.remove(window.tabId)
  }
  document.getElementById('closeTabLink').addEventListener('click', window.closeTabFunction)
  // Close window after a pause
  setTimeout(window.closeTabFunction, 5000)
}

const loginTime = () => {
  // If we're on the auth page, don't do anything
  if (window.onAuthUrl) { return }

  const loginMessage = document.getElementById('sign_in_message')
  if (utilities.retryIfMissing(loginMessage, loginTime)) { return }
  utilities.elementsHide('#new_rating, #whitespace-preserver')
  utilities.elementsShow(loginMessage)
  utilities.pageLoadedFunctions()
}

const logout = () => {
  removeAuthData()
  utilities.toggleMenu(false, true)

  utilities.elementsHide('#new_rating')
  utilities.elementsShow('#auth_message_out')
  // Close popup after a pause
  setTimeout(window.close, 5000)
}

export default {
  authPageSuccess,
  checkAuthToken,
  loginTime,
  logout
}
