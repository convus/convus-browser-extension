import log from './log' // eslint-disable-line
import api from './api' // eslint-disable-line

// Oh Chrome, it would be great if you used `browser` instead of `chrome`
if (process.env.browser_target == 'chrome') { browser = chrome } // eslint-disable-line

browser.storage.local.get('reviewToken')
  .then(data => data.reviewToken)
  .then(reviewToken => {
    if (typeof (reviewToken) === 'undefined' || reviewToken === null) {
      loginTime()
    } else {
      window.reviewToken = reviewToken
      reviewTime()
      checkReviewToken(reviewToken)
    }
  })

browser.storage.local.get('topicsVisible')
  .then(data => data.topicsVisible)
  .then(topicsVisible => { toggleTopicsVisible(topicsVisible, true) })

browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  // since only one tab should be active and in the current window at once
  // the return variable should only have one entry
  const activeTab = tabs[0]
  // window.storedTabUrl = activeTab.url // this is available in updateReviewFields
  // log.debug(tabs[0])
  updateReviewFields(activeTab.url, activeTab.title)
})

const checkReviewToken = async function (token) {
  const authUrl = formAuthUrl()
  if (typeof (authUrl) === 'undefined' || authUrl === null) {
    log.debug('authUrl not present in DOM, trying again in 50ms')
    return setTimeout(checkReviewToken, 50, token)
  }
  // log.debug('checking review token:', token)
  const result = await api.isReviewTokenValid(authUrl, token)
  if (result) { return }
  // Remove the existing data that is incorrect - maybe actually do in form submit?
  browser.storage.local.remove('reviewToken')
  window.reviewToken = undefined
  loginTime()
}

const updateReviewFields = (tabUrl, title) => {
  // pause and rerun if DOM hasn't loaded
  const reviewUrlField = document.getElementById('submitted_url')
  if (typeof (reviewUrlField) === 'undefined' || reviewUrlField === null) {
    log.debug('reviewUrlField not present in DOM, trying again in 50ms')
    return setTimeout(updateReviewFields, 50, tabUrl, title)
  }
  reviewUrlField.value = tabUrl
  document.getElementById('citation_title').value = title
  document.getElementById('timezone').value = Intl.DateTimeFormat().resolvedOptions().timeZone
}

const formAuthUrl = () => document.getElementById('new_user')?.getAttribute('action')
const formNewReviewUrl = () => document.getElementById('new_review')?.getAttribute('action')

const loginTime = () => {
  // log.debug("it's login time")
  const loginForm = document.getElementById('new_user')
  if (typeof (loginForm) === 'undefined' || loginForm === null) {
    log.debug('login form not present in DOM, trying again in 50ms')
    return setTimeout(loginTime, 50)
  }
  loginForm.classList.remove('hidden')
  document.getElementById('new_review')?.classList?.add('hidden')
  loginForm.addEventListener('submit', handleLoginSubmit)
}

const reviewTime = () => {
  const reviewForm = document.getElementById('new_review')
  if (typeof (reviewForm) === 'undefined' || reviewForm === null) {
    log.debug('review form not present in DOM, trying again in 50ms')
    return setTimeout(reviewTime, 50)
  }
  // I think it's a good thing to attach the event listener to the review form
  reviewForm.addEventListener('submit', handleReviewSubmit)
  // Attach the menu functionality
  document.getElementById('review-menu-btn').addEventListener('click', toggleMenu)
  document.querySelectorAll('#review-menu .form-control-check input').forEach(el => el.addEventListener('change', updateMenuCheck))
  document.getElementById('logout-btn').addEventListener('click', logout)
  // ... but only show or hide the form if reviewToken is set, in case of weird callback stuff
  if (window.reviewToken) {
    document.getElementById('new_user').classList.add('hidden')
    reviewForm.classList.remove('hidden')
  }
}

const handleLoginSubmit = async function (e) {
  e.preventDefault()
  const formData = new FormData(document.getElementById('new_user'))
  const jsonFormData = JSON.stringify(Object.fromEntries(formData))

  const result = await api.getReviewToken(formAuthUrl(), jsonFormData)
  // log.debug(result)

  if (typeof (result.reviewToken) === 'undefined' || result.reviewToken === null) {
    renderAlerts(result.message)
  } else {
    browser.storage.local.set(result)
    window.reviewToken = result.reviewToken
    hideAlerts()
    reviewTime()
  }

  return false // fallback prevent submit
}

const handleReviewSubmit = async function (e) {
  e.preventDefault()
  const formData = new FormData(document.getElementById('new_review'))
  const jsonFormData = JSON.stringify(Object.fromEntries(formData))
  const result = await api.submitReview(formNewReviewUrl(), window.reviewToken, jsonFormData)

  log.debug(result)
  renderAlerts(result.message, result.share)
  if (result.success) {
    document.getElementById('new_review').classList.add('hidden')
    toggleMenu(false, true)
  }

  return false // fallback prevent submit
}

const hideAlerts = () => {
  const visibleAlerts = document.querySelectorAll('.alert')
  visibleAlerts.forEach(el => el.classList.add('hidden'))
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

  log.debug(shareText, typeof (shareText) !== 'undefined' && shareText !== null)
  if (typeof (shareText) !== 'undefined' && shareText !== null) {
    alert.after(shareDiv(shareText))
  }
}

const toggleTopicsVisible = (isVisible, isOnLoad = false) => {
  window.topicsVisibile = isVisible
  const topicsField = document.getElementById('field-group-topics')
  if (typeof (topicsField) === 'undefined' || topicsField === null) {
    log.debug('topics field not present in DOM, trying again in 50ms')
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
  const menuBtn = document.getElementById('review-menu-btn')
  const menu = document.getElementById('review-menu')
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

const shareDiv = (shareText) => {
  const el = document.querySelector("#templates .shareTemplate")
  let clone = el.cloneNode(true)
  return clone
}

const updateMenuCheck = (e) => {
  const el = e.target
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
  browser.storage.local.remove('reviewToken')
  toggleMenu(false, true)
  loginTime()
}

// Not currently using - but want to remember how to do if necessary in the future
// const closePopup = () { window.close }
