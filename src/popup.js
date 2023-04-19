import log from './log' // eslint-disable-line
import api from './api' // eslint-disable-line

// Oh Chrome, it would be great if you used `browser` instead of `chrome`
if (process.env.browser_target == 'chrome') { browser = chrome } // eslint-disable-line

browser.storage.local.get('ratingToken')
  .then(data => data.ratingToken)
  .then(ratingToken => {
    if (typeof (ratingToken) === 'undefined' || ratingToken === null) {
      loginTime()
    } else {
      window.apiToken = apiToken
      ratingTime()
      checkRatingToken(ratingToken)
    }
  })

browser.storage.local.get('topicsVisible')
  .then(data => data.topicsVisible)
  .then(topicsVisible => { toggleTopicsVisible(topicsVisible, true) })

browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  // since only one tab should be active and in the current window at once
  // the return variable should only have one entry
  const activeTab = tabs[0]
  // window.storedTabUrl = activeTab.url // this is available in updateRatingFields
  // log.debug(tabs[0])
  updateRatingFields(activeTab.url, activeTab.title)
})

const checkRatingToken = async function (token) {
  const authUrl = formAuthUrl()
  if (typeof (authUrl) === 'undefined' || authUrl === null) {
    // log.debug('authUrl not present in DOM, trying again in 50ms')
    return setTimeout(checkRatingToken, 50, token)
  }
  // log.debug('checking rating token:', token)
  const result = await api.isRatingTokenValid(authUrl, token)
  if (result) { return }
  // Remove the existing data that is incorrect - maybe actually do in form submit?
  browser.storage.local.remove('ratingToken')
  window.ratingToken = undefined
  loginTime()
}

const updateRatingFields = (tabUrl, title) => {
  // pause and rerun if DOM hasn't loaded
  const ratingUrlField = document.getElementById('submitted_url')
  if (typeof (ratingUrlField) === 'undefined' || ratingUrlField === null) {
    log.debug('ratingUrlField not present in DOM, trying again in 50ms')
    return setTimeout(updateRatingFields, 50, tabUrl, title)
  }
  ratingUrlField.value = tabUrl
  document.getElementById('citation_title').value = title
  document.getElementById('timezone').value = Intl.DateTimeFormat().resolvedOptions().timeZone
}

const formAuthUrl = () => document.getElementById('new_user')?.getAttribute('action')
const formNewRatingUrl = () => document.getElementById('new_rating')?.getAttribute('action')

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
}

const ratingTime = () => {
  const ratingForm = document.getElementById('new_rating')
  if (typeof (ratingForm) === 'undefined' || ratingForm === null) {
    log.debug('rating form not present in DOM, trying again in 50ms')
    return setTimeout(ratingTime, 50)
  }
  // I think it's a good thing to attach the event listener to the rating form
  ratingForm.addEventListener('submit', handleRatingSubmit)
  // Attach the menu functionality
  document.getElementById('rating-menu-btn').addEventListener('click', toggleMenu)
  document.querySelectorAll('#rating-menu .form-control-check input').forEach(el => el.addEventListener('change', updateMenuCheck))
  document.getElementById('logout-btn').addEventListener('click', logout)
  // ... but only show or hide the form if ratingToken is set, in case of weird callback stuff
  if (window.ratingToken) {
    document.getElementById('new_user').classList.add('hidden')
    ratingForm.classList.remove('hidden')
  }
}

const handleLoginSubmit = async function (e) {
  e.preventDefault()
  const formData = new FormData(document.getElementById('new_user'))
  const jsonFormData = JSON.stringify(Object.fromEntries(formData))

  const result = await api.getRatingToken(formAuthUrl(), jsonFormData)
  // log.debug(result)

  if (typeof (result.ratingToken) === 'undefined' || result.ratingToken === null) {
    renderAlerts(result.message)
  } else {
    browser.storage.local.set(result)
    window.ratingToken = result.ratingToken
    hideAlerts()
    ratingTime()
  }

  return false // fallback prevent submit
}

const handleRatingSubmit = async function (e) {
  e.preventDefault()
  const formData = new FormData(document.getElementById('new_rating'))
  const jsonFormData = JSON.stringify(Object.fromEntries(formData))
  const result = await api.submitRating(formNewRatingUrl(), window.ratingToken, jsonFormData)

  log.debug(result)
  renderAlerts(result.message, result.share)
  if (result.success) {
    document.getElementById('new_rating').classList.add('hidden')
    toggleMenu(false, true)
  }

  return false // fallback prevent submit
}

const hideAlerts = () => {
  const visibleAlerts = document.querySelectorAll('.alert')
  visibleAlerts.forEach(el => el.classList.add('hidden'))
  const visibleShares = document.querySelectorAll('.shareVisible')
  visibleShares.forEach(el => el.classList.add('hidden'))
}

// message is an array of: [kind, text]
const renderAlerts = (message, shareText = null) => {
  hideAlerts()
  const kind = message[0]
  const text = message[1]
  const body = document.getElementById('body-popup')
  const alert = document.createElement('div')
  alert.textContent = text
  alert.classList.add(`alert-${kind}`, 'alert', 'my-4')
  body.prepend(alert)

  if (typeof (shareText) !== 'undefined' && shareText !== null) {
    alert.after(shareDiv(shareText))
  }
}

const toggleTopicsVisible = (isVisible, isOnLoad = false) => {
  window.topicsVisibile = isVisible
  const topicsField = document.getElementById('field-group-topics')
  if (typeof (topicsField) === 'undefined' || topicsField === null) {
    // log.debug('topics field not present in DOM, trying again in 50ms')
    return setTimeout(toggleTopicsVisible, 50, isVisible, isOnLoad)
  }
  if (window.topicsVisibile) {
    topicsField.classList.remove('hidden')
  } else {
    topicsField.classList.add('hidden')
  }
  // If it's on load, set the checkbox - otherwise, set the local storage
  if (isOnLoad) {
    document.getElementById('show_topics').checked = isVisible
  } else {
    browser.storage.local.set({ topicsVisible: isVisible })
  }
}

// closeMenu can be: ["toggle", true, false]
const toggleMenu = (event = false, closeMenu = 'toggle') => {
  event && event.preventDefault()
  const menuBtn = document.getElementById('rating-menu-btn')
  const menu = document.getElementById('rating-menu')
  const action = closeMenu === 'toggle' ? menu.classList.contains('active') : closeMenu
  if (action) {
    menu.classList.add('hidden')
    menu.classList.remove('active')
    menuBtn.classList.remove('active')
  } else {
    menu.classList.remove('hidden')
    menu.classList.add('active')
    menuBtn.classList.add('active')
  }
}

const copyShare = (event) => {
  // Get the share wrapper
  const el = event.target.closest('.shareVisible')
  const shareText = el.getAttribute('data-sharetext')
  // log.debug(`copyShare: ${shareText}`)
  navigator.clipboard.writeText(shareText)
  const copiedAlert = document.createElement('p')
  copiedAlert.textContent = 'Copied results to clipboard'
  copiedAlert.classList.add('text-center', 'px-2', 'py-2', 'mt-4')
  el.append(copiedAlert)
}

const shareDiv = (shareText) => {
  const template = document.querySelector('#templates .shareTemplate')
  const el = template.cloneNode(true)
  el.classList.remove('shareTemplate')
  el.classList.add('shareVisible')
  el.setAttribute('data-sharetext', shareText)
  el.querySelector('.btnShare').addEventListener('click', copyShare)
  return el
}

const updateMenuCheck = (event) => {
  const el = event.target
  const fieldId = el.getAttribute('data-target-id')

  if (fieldId === 'field-group-topics') {
    toggleTopicsVisible(el.checked)
  } else if (el.checked) {
    document.getElementById(fieldId).classList.remove('hidden')
  } else {
    document.getElementById(fieldId).classList.add('hidden')
  }
}

const logout = () => {
  browser.storage.local.remove('ratingToken')
  toggleMenu(false, true)
  loginTime()
}

// Not currently using - but want to remember how to do if necessary in the future
// const closePopup = () { window.close }
