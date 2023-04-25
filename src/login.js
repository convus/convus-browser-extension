import log from './log' // eslint-disable-line
import api from './api'
import utilities from './utilities'

// Internal
const formAuthUrl = () => document.getElementById('new_user')?.getAttribute('action')

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
  utilities.elementsHide('#new_rating, #new_user')
  // Hide other forms
  // document.getElementById('new_rating')?.classList?.add('hidden')
  // document.getElementById('new_user')?.classList?.add('hidden')
}

const checkAuthToken = async function (token) {
  const authUrl = formAuthUrl()
  if (utilities.retryIfMissing(authUrl, checkAuthToken, token)) { return }

  // log.debug('checking rating token:', token)
  const result = await api.isAuthTokenValid(authUrl, token)
  if (result) { return }
  // Remove the existing data that is incorrect - maybe actually do in form submit?
  removeAuthData()
  loginTime()
}

const authPageSuccess = ({ authToken, currentName }) => {
  utilities.hideAlerts()
  storeAuthData({ authToken: authToken, currentName: currentName })
  renderAuthMessage("You're signed in to the Convus browser extension")
}

const loginTime = () => {
  const loginMessage = document.getElementById('sign_in_message')
  if (utilities.retryIfMissing(loginMessage, loginTime)) { return }

  // loginMessage.classList.remove('hidden')
  utilities.elementsShow(loginMessage)
  utilities.elementsHide('#new_rating')
  // document.getElementById('new_user')?.classList?.add('hidden')

  utilities.pageLoadedFunctions()
}

const logout = () => {
  removeAuthData()
  utilities.toggleMenu(false, true)
  renderAuthMessage('logged out from the Convus browser extension')
}

export default {
  authPageSuccess,
  checkAuthToken,
  loginTime,
  logout
}
