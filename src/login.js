import log from './log' // eslint-disable-line
import api from './api'
import utilities from './utilities'

// I don't think it's necessary anymore?
// import rating from './rating'

// Internal
const formAuthUrl = () => document.getElementById('new_user')?.getAttribute('action')

// // Internal
// const handleLoginSubmit = async function (e) {
//   e.preventDefault()
//   const formData = new FormData(document.getElementById('new_user'))
//   const jsonFormData = JSON.stringify(Object.fromEntries(formData))

//   const result = await api.getAuthToken(formAuthUrl(), jsonFormData)
//   log.debug(result)

//   if (typeof (result.authToken) === 'undefined' || result.authToken === null) {
//     utilities.renderAlerts(result.message)
//   } else {
//     storeAuthData(result)
//     utilities.hideAlerts()
//     rating.ratingTime()
//   }

//   return false // fallback prevent submit
// }

// Internal
const storeAuthData = ({ authToken, currentName }) => {
  // TODO, there has to be a better way to handle passing the arguments
  browser.storage.local.set({ authToken: authToken, currentName: currentName })
  window.authToken = authToken
  window.currentName = currentName
}

// Internal
const renderAuthMessage = (message) => {
  const authMessage = document.getElementById('auth_message')
  if (utilities.retryIfMissing(authMessage, renderAuthMessage, message)) { return }

  document.getElementById('authMessageEl').textContent = message
  authMessage.classList.remove('hidden')
  // Hide other forms
  document.getElementById('new_rating')?.classList?.add('hidden')
  document.getElementById('new_user')?.classList?.add('hidden')
}

const checkAuthToken = async function (token) {
  const authUrl = formAuthUrl()
  if (utilities.retryIfMissing(authUrl, checkAuthToken, token)) { return }

  // log.debug('checking rating token:', token)
  const result = await api.isAuthTokenValid(authUrl, token)
  if (result) { return }
  // Remove the existing data that is incorrect - maybe actually do in form submit?
  browser.storage.local.remove('authToken')
  browser.storage.local.remove('name')
  window.authToken = undefined
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

  loginMessage.classList.remove('hidden')
  document.getElementById('new_rating')?.classList?.add('hidden')
  utilities.pageLoadedFunctions()
}

const logout = () => {
  browser.storage.local.remove('authToken')
  utilities.toggleMenu(false, true)
  renderAuthMessage('logged out from the Convus browser extension')
}

export default {
  authPageSuccess,
  checkAuthToken,
  loginTime,
  logout
}
