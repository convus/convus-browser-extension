import log from './log' // eslint-disable-line
import api from './api' // eslint-disable-line

chrome.storage.local.get('reviewToken')
  .then(data => data.reviewToken)
  .then(reviewToken => {
    if (typeof (reviewToken) === 'undefined' || reviewToken === null) {
      loginTime()
    } else {
      window.reviewToken = reviewToken
      reviewTime() // I'm worried that this will interfere with
      checkReviewToken(reviewToken)
    }
  })

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  // since only one tab should be active and in the current window at once
  // the return variable should only have one entry
  const activeTab = tabs[0]
  // window.storedTabUrl = activeTab.url // this is available in updateReviewFields
  // log.debug(tabs[0])
  updateReviewFields(activeTab.url, activeTab.title)
})

const checkReviewToken = async function (token) {
  const authUrl = formAuthUrl()
  // pause and rerun if DOM hasn't loaded
  if (typeof (authUrl) === 'undefined' || authUrl === null) {
    log.debug(`authUrl not present in DOM, trying later (${token})`)
    return setTimeout(checkReviewToken, 50, token)
  }
  // log.debug('checking review token:', token)
  const result = await api.verifyReviewTokenValid(token, authUrl)
  if (result) { return }
  // Remove the existing data that is incorrect - maybe actually do in form submit?
  chrome.storage.local.remove("reviewToken")
  window.reviewToken = undefined
  loginTime()
}

const updateReviewFields = (tabUrl, title) => {
  // pause and rerun if DOM hasn't loaded
  const reviewUrlField = document.getElementById('submitted_url')
  if (typeof (reviewUrlField) === 'undefined' || reviewUrlField === null) {
    log.debug('reviewUrlField not present in DOM, trying later')
    return setTimeout(updateReviewFields, 50, tabUrl, title)
  }
  reviewUrlField.value = tabUrl
  document.getElementById('citation_title').value = title
}

const formAuthUrl = () => document.getElementById('new_user')?.getAttribute('action')
// const formNewReviewUrl = () => document.getElementById('new_review')?.getAttribute('action')

const loginTime = () => {
  log.debug("it's login time")
  // pause and rerun if DOM hasn't loaded
  const loginForm = document.getElementById('new_user')
  if (typeof (loginForm) === 'undefined' || loginForm === null) {
    log.debug('login form not present in DOM, trying later')
    return setTimeout(loginTime, 50)
  }
  loginForm.classList.remove('hidden')
  document.getElementById('new_review')?.classList?.add('hidden')
  loginForm.addEventListener('submit', handleLoginSubmit)
}

const reviewTime = () => {
  // pause and rerun if DOM hasn't loaded
  const reviewForm = document.getElementById('new_review')
  if (typeof (reviewForm) === 'undefined' || reviewForm === null) {
    log.debug('review form not present in DOM, trying later')
    return setTimeout(reviewTime, 50)
  }
  // I think it's a good thing to attach the event listener to the review form
  reviewForm.addEventListener('submit', handleReviewSubmit)
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

  const result = await api.getReviewToken(jsonFormData, formAuthUrl())
  log.debug(result)
  if (typeof (result.reviewToken) === 'undefined' || result.reviewToken === null) {
    renderAlert(result.message)
  } else {
    chrome.storage.local.set(result)
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
  log.debug(jsonFormData)

  // Close the popup
  // return setTimeout(window.close, 1000)

  return false // fallback prevent submit
}

const hideAlerts = () => {
  const visibleAlerts = document.querySelectorAll('.alert')
  visibleAlerts.forEach(el => el.classList.add('hidden'))
}

const renderAlert = (text, kind = 'error') => {
  hideAlerts()
  const body = document.getElementById('body-popup')
  const alert = document.createElement('div')
  alert.textContent = text
  alert.classList.add(`alert-${kind}`, 'alert', 'my-4')
  body.prepend(alert)
}

// chrome.storage.local.remove("reviewToken")
