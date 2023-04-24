import log from './log' // eslint-disable-line
import api from './api'
import utilities from './utilities'
// only importing rating for ratingTime - shouldn't import the rest :/
import rating from './rating'

// Internal
const handleLoginSubmit = async function (e) {
  e.preventDefault()
  const formData = new FormData(document.getElementById('new_user'))
  const jsonFormData = JSON.stringify(Object.fromEntries(formData))

  const result = await api.getAuthToken(formAuthUrl(), jsonFormData)
  log.debug(result)

  if (typeof (result.authToken) === 'undefined' || result.authToken === null) {
    utilities.renderAlerts(result.message)
  } else {
    browser.storage.local.set(result)
    window.authToken = result.authToken
    window.currentName = result.currentName
    utilities.hideAlerts()
    rating.ratingTime()
  }

  return false // fallback prevent submit
}

// Internal
const formAuthUrl = () => document.getElementById('new_user')?.getAttribute('action')

const checkAuthToken = async function (token) {
  const authUrl = formAuthUrl()
  if (typeof (authUrl) === 'undefined' || authUrl === null) {
    log.debug('authUrl not present in DOM, trying again in 50ms')
    return setTimeout(checkAuthToken, 50, token)
  }
  // log.debug('checking rating token:', token)
  const result = await api.isAuthTokenValid(authUrl, token)
  if (result) { return }
  // Remove the existing data that is incorrect - maybe actually do in form submit?
  browser.storage.local.remove('authToken')
  browser.storage.local.remove('name')
  window.authToken = undefined
  loginTime()
}

const loginTime = () => {
  // log.debug("it's login time")
  const loginForm = document.getElementById('new_user')
  if (typeof (loginForm) === 'undefined' || loginForm === null) {
    log.debug('login form not present in DOM, trying again in 50ms')
    return setTimeout(loginTime, 50)
  }
  loginForm.classList.remove('hidden')
  document.getElementById('new_rating')?.classList?.add('hidden')
  loginForm.addEventListener('submit', handleLoginSubmit)
  utilities.pageLoadedFunctions()
}

const logout = () => {
  browser.storage.local.remove('authToken')
  utilities.toggleMenu(false, true)
  loginTime()
}

export default {
  checkAuthToken,
  loginTime,
  logout
}
