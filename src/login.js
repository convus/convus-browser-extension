import log from './log' // eslint-disable-line
import api from './api'
// only importing for showRatingForm, TODO stop importing the rest
import rating from './rating'
import utilities from './utilities'

// Internal
const baseUrl = process.env.baseUrl
const formAuthUrl = baseUrl + '/api/v1/auth'
const authUrl = baseUrl + '/browser_extension_auth'

// Internal
const storeAuthData = (authToken, currentName) => {
  // TODO: ^ there has to be a better way to handle passing the arguments
  browser.storage.local.set({ authToken: authToken, currentName: currentName })
  window.authToken = authToken
  window.currentName = currentName
}

// Internal
const countdownAndClose = (selector, ms, closeFunc = false) => {
  let secondsLeft = ms / 1000
  const countdownEl = document.querySelector(selector)
  countdownEl.textContent = secondsLeft // Set the initial time
  const countdownTimer = setInterval(function () {
    countdownEl.textContent = secondsLeft -= 1
    if (secondsLeft <= 0) { clearInterval(countdownTimer) }
  }, 1000)
  // Run special close function
  if (closeFunc) { setTimeout(closeFunc, ms) }
  // Firefox doesn't close the popup on when the tab is closed, so make sure it happens
  // Close the popup by default
  setTimeout(window.close, ms)
}

// Internal
const removeAuthData = () => {
  browser.storage.local.remove('authToken')
  browser.storage.local.remove('currentName')
  window.authToken = undefined
}

const isAuthUrl = (url = null) => authUrl === (url || window.currentUrl)
const isSignInOrUpUrl = (url = null) => {
  url ||= window.currentUrl
  // These are the URLs the user is sent to if they aren't signed signed in to Convus
  // when they try to login to the extension
  return (`${baseUrl}/users/sign_in` === url) || (`${baseUrl}/users/sign_up` === url)
}

const checkAuthToken = async function (token) {
  if (utilities.retryIfMissing(formAuthUrl, checkAuthToken, token)) { return }

  const result = await api.isAuthTokenValid(formAuthUrl, token)
  log.trace('auth token check success:', result)
  if (result) {
    rating.showRatingForm()
    return
  }
  // Remove the existing data that is incorrect - maybe actually do in form submit?
  removeAuthData()
  loginTime()
}

const loginFromAuthPageData = (authToken, currentName) => {
  log.trace(`loginFromAuthPageData - authToken: ${authToken}, ${currentName}`)
  utilities.hideAlerts()
  storeAuthData(authToken, currentName)
  // in case we're already showing the "sign in to auth" message
  utilities.elementsHide('.spinners, #new_rating, #whitespace-preserver')
  utilities.elementsShow('#auth_message_in')

  window.closeTabFunction = (event = false) => {
    event && event.preventDefault()
    chrome.tabs.remove(window.tabId)
  }
  document.getElementById('closeTabLink').addEventListener('click', window.closeTabFunction)
  countdownAndClose('#in_countdown', 3000, window.closeTabFunction)
}

const loginTime = () => {
  log.trace('loginTime')
  // If we're on the auth page, exit
  if (isAuthUrl()) { return }
  const loginMessage = document.getElementById('sign_in_message')
  if (utilities.retryIfMissing(loginMessage, loginTime)) { return }
  // If the user is signing in or signing up on Convus, show text rather than a button which opens another tab
  if (isSignInOrUpUrl()) {
    log.debug('sign in page!!!')
    document.querySelector('#sign_in_message p').textContent = 'Sign in to Convus on this page'
  }
  utilities.elementsHide('.spinners, #new_rating, #whitespace-preserver')
  utilities.elementsShow(loginMessage)
  utilities.pageLoadedFunctions()

  // In Firefox, the popup stays around after you click the signIn button
  // Ideally, this would call getCurrentTab, but I couldn't figure out how, so just closing
  document.getElementById('signInBtn').addEventListener('click', () => {
    setTimeout(window.close, 100)
  })
}

const logout = () => {
  removeAuthData()
  utilities.toggleMenu(false, 'hide')

  utilities.elementsHide('#new_rating')
  utilities.elementsShow('#auth_message_out')
  countdownAndClose('#out_countdown', 5000)
}

export default {
  loginFromAuthPageData,
  checkAuthToken,
  isAuthUrl,
  isSignInOrUpUrl,
  loginTime,
  logout
}
