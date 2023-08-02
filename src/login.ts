import log from './log' // eslint-disable-line
import api from './api'
// TODO: only import isAuthTokenValid
import rating from './rating'
import utilities from './utilities'

// Internal
// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
const baseUrl = process.env.baseUrl
const formAuthUrl = baseUrl + '/api/v1/auth'
const authUrl = baseUrl + '/browser_extension_auth'

// Internal
const storeAuthData = (authToken: any, currentName: any) => {
  // TODO: ^ there has to be a better way to handle passing the arguments
  // ... Destructuring assignment was causing issues in Safari
  // @ts-expect-error TS(2304): Cannot find name 'browser'.
  browser.storage.local.set({ authToken: authToken, currentName: currentName })
  // @ts-expect-error TS(2339): Property 'authToken' does not exist on type 'Windo... Remove this comment to see the full error message
  window.authToken = authToken
  // @ts-expect-error TS(2339): Property 'currentName' does not exist on type 'Win... Remove this comment to see the full error message
  window.currentName = currentName
}

// Internal
const handleFallbackLoginSubmit = async function (e: any) {
  e.preventDefault()
  // @ts-expect-error TS(2345): Argument of type 'HTMLElement | null' is not assig... Remove this comment to see the full error message
  const formData = new FormData(document.getElementById('new_user'))
  // @ts-expect-error TS(2550): Property 'fromEntries' does not exist on type 'Obj... Remove this comment to see the full error message
  const jsonFormData = JSON.stringify(Object.fromEntries(formData))

  const result = await api.getAuthToken(formAuthUrl, jsonFormData)
  log.debug(result)
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  if (typeof (result.authToken) === 'undefined' || result.authToken === null) {
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    utilities.renderAlerts(result.message)
  } else {
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    storeAuthData(result.authToken, result.currentName)
    utilities.hideAlerts()
    if (isAuthUrl()) {
      utilities.elementsCollapse('#new_user')
      utilities.renderAlerts([['success', 'Logged in!']])
    } else {
      rating.showRatingForm()
    }
  }
  return false // fallback prevent submit
}

// Internal
const countdownAndClose = (selector: any, ms: any, closeFunc = false) => {
  let secondsLeft = ms / 1000
  const countdownEl = document.querySelector(selector)
  countdownEl.textContent = secondsLeft // Set the initial time
  const countdownTimer = setInterval(function () {
    countdownEl.textContent = secondsLeft -= 1
    if (secondsLeft <= 0) { clearInterval(countdownTimer) }
  }, 1000)
  // Run special close function
  // @ts-expect-error TS(2345): Argument of type 'boolean' is not assignable to pa... Remove this comment to see the full error message
  if (closeFunc) { setTimeout(closeFunc, ms) }
  // Firefox doesn't close the popup on when the tab is closed - so, always close the popup
  setTimeout(window.close, ms)
}

// Internal
const removeAuthData = () => {
  // @ts-expect-error TS(2304): Cannot find name 'browser'.
  browser.storage.local.remove('authToken')
  // @ts-expect-error TS(2304): Cannot find name 'browser'.
  browser.storage.local.remove('currentName')
  // @ts-expect-error TS(2339): Property 'authToken' does not exist on type 'Windo... Remove this comment to see the full error message
  window.authToken = undefined
}

// @ts-expect-error TS(2339): Property 'currentUrl' does not exist on type 'Wind... Remove this comment to see the full error message
const isAuthUrl = (url = null) => authUrl === (url || window.currentUrl)

const isSignInOrUpUrl = (url = null) => {
  // @ts-expect-error TS(2339): Property 'currentUrl' does not exist on type 'Wind... Remove this comment to see the full error message
  url ||= window.currentUrl
  // These are the URLs the user is sent to if they aren't signed signed in to Convus
  // when they try to login to the extension
  return (`${baseUrl}/users/sign_in` === url) || (`${baseUrl}/users/sign_up` === url)
}

const checkAuthToken = async function (token: any) {
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

const loginFromAuthPageData = (authToken: any, currentName: any) => {
  log.trace(`loginFromAuthPageData - authToken: ${authToken}, ${currentName}`)
  utilities.hideAlerts()
  storeAuthData(authToken, currentName)
  // in case we're already showing the "sign in to auth" message
  utilities.elementsHide('.spinners, #new_rating, #whitespace-preserver, #sign_in_message')
  utilities.elementsShow('#auth_message_in')

  // @ts-expect-error TS(2339): Property 'closeTabFunction' does not exist on type... Remove this comment to see the full error message
  window.closeTabFunction = (event = false) => {
    // @ts-expect-error TS(2339): Property 'preventDefault' does not exist on type '... Remove this comment to see the full error message
    event && event.preventDefault()
    // @ts-expect-error TS(2304): Cannot find name 'chrome'.
    chrome.tabs.remove(window.tabId)
  }
  // @ts-expect-error TS(2531): Object is possibly 'null'.
  document.getElementById('closeTabLink').addEventListener('click', window.closeTabFunction)
  // @ts-expect-error TS(2339): Property 'closeTabFunction' does not exist on type... Remove this comment to see the full error message
  countdownAndClose('#in_countdown', 3000, window.closeTabFunction)
}

const loginTime = () => {
  log.trace('loginTime')
  // If we're on the auth page, exit
  if (isAuthUrl()) { return }
  // If doing fallback login, do that :(
  // @ts-expect-error TS(2339): Property 'fallbackLogin' does not exist on type 'W... Remove this comment to see the full error message
  if (window.fallbackLogin) { return }
  const loginMessage = document.getElementById('sign_in_message')
  if (utilities.retryIfMissing(loginMessage, loginTime)) { return }
  // If the user is signing in or signing up on Convus, show text rather than a button which opens another tab
  if (isSignInOrUpUrl()) {
    log.debug('sign in page!!!')
    // @ts-expect-error TS(2531): Object is possibly 'null'.
    document.querySelector('#sign_in_message p').textContent = 'Sign in to Convus on this page'
  }
  utilities.elementsHide('.spinners, #new_rating, #whitespace-preserver')
  utilities.elementsShow(loginMessage)
  utilities.pageLoadedFunctions()

  // In Firefox, the popup stays around after you click the signIn button
  // Ideally, this would call getCurrentTab, but I couldn't figure out how, so just closing
  // @ts-expect-error TS(2531): Object is possibly 'null'.
  document.getElementById('signInBtn').addEventListener('click', () => {
    setTimeout(window.close, 100)
  })
}

// This shows the login form - it should only happen if the browser extension can't parse the page,
// which happens in older versions of safari
const fallbackLoginTime = () => {
  log.debug('fallbacklogintime - UNABLE TO PARSE THE PAGE, probably Safari BS')
  // @ts-expect-error TS(2339): Property 'fallbackLogin' does not exist on type 'W... Remove this comment to see the full error message
  window.fallbackLogin = true
  const loginForm = document.getElementById('new_user')
  if (utilities.retryIfMissing(loginForm, loginTime)) { return }

  utilities.elementsHide('#new_rating, .spinners, #whitespace-preserver, #sign_in_message')
  utilities.elementsShow(loginForm)
  // @ts-expect-error TS(2531): Object is possibly 'null'.
  loginForm.addEventListener('submit', handleFallbackLoginSubmit)
}

const logout = () => {
  removeAuthData()
  // @ts-expect-error TS(2345): Argument of type '"hide"' is not assignable to par... Remove this comment to see the full error message
  utilities.toggleMenu(false, 'hide')

  utilities.elementsHide('#new_rating')
  utilities.elementsShow('#auth_message_out')
  countdownAndClose('#out_countdown', 5000)
}

export default {
  loginFromAuthPageData,
  checkAuthToken,
  fallbackLoginTime,
  isAuthUrl,
  isSignInOrUpUrl,
  loginTime,
  logout
}
