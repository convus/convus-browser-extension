import log from './log' // eslint-disable-line
import api from './api'
import utilities from './utilities'

// Internal
const baseUrl = process.env.baseUrl
const formAuthUrl = baseUrl + "/api/v1/auth"


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
  browser.storage.local.remove('name')
  window.authToken = undefined
}

// Internal
const renderAuthMessage = (message) => {
  const authMessage = document.getElementById('auth_message')
  if (utilities.retryIfMissing(authMessage, renderAuthMessage, message)) { return }

  document.getElementById('authMessageEl').textContent = message
  utilities.elementsShow(authMessage)
  // authMessage.classList.remove('hidden')
  utilities.elementsHide('#new_rating')
  // Hide other forms
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
  // in case we're already showing the "sign in to auth" message
  utilities.elementsHide('#auth_message, .spinners')
  storeAuthData({ authToken: authToken, currentName: currentName })
  renderAuthMessage("You're signed in!")
}

const loginTime = () => {
  // If we're on the auth page, don't do anything
  if (!!window.onAuthUrl) { return }

  const loginMessage = document.getElementById('sign_in_message')
  if (utilities.retryIfMissing(loginMessage, loginTime)) { return }
  utilities.elementsShow(loginMessage)
  utilities.elementsHide('#new_rating')
  utilities.pageLoadedFunctions()
}

const logout = () => {
  removeAuthData()
  utilities.toggleMenu(false, true)
  renderAuthMessage('Logged out from the Convus browser extension')
}

export default {
  authPageSuccess,
  checkAuthToken,
  loginTime,
  logout
}
