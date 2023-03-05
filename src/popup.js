import log from './log' // eslint-disable-line
import api from './api' // eslint-disable-line

chrome.storage.local.get('reviewToken')
  .then(data => data.reviewToken)
  .then(reviewToken => {
    if (typeof (reviewToken) === 'undefined' || reviewToken === null) {
      loginTime()
    } else {
      window.reviewToken = reviewToken
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
  log.debug('checking review token:', token)
  const result = await api.verifyReviewTokenValid(token, authUrl)
  if (!result) { loginTime() }
}

const updateReviewFields = (tabUrl, title) => {
  // pause and rerun if DOM hasn't loaded
  const reviewUrlField = document.getElementById('review_submitted_url')
  if (typeof (reviewUrlField) === 'undefined' || reviewUrlField === null) {
    log.debug('authUrl not present in DOM, trying later')
    return setTimeout(reviewUrlField, 50, tabUrl, title)
  }
  reviewUrlField.value = tabUrl
  document.getElementById('review_citation_title').value = title
}

const formAuthUrl = () => document.getElementById('new_user')?.getAttribute('action')
// const formNewReviewUrl = () => document.getElementById('new_review_form')?.getAttribute('action')

const loginTime = () => {
  log.debug("it's login time")
  // pause and rerun if DOM hasn't loaded
  const loginForm = document.getElementById('new_user')
  if (typeof (loginForm) === 'undefined' || loginForm === null) {
    log.debug('login form not present in DOM, trying later')
    return setTimeout(loginTime, 50)
  }
  // Remove the existing data that is incorrect - maybe actually do in form submit?
  // chrome.storage.local.remove("reviewToken")
  // window.reviewToken = undefined
  loginForm.classList.remove('hidden')
  document.getElementById('new_review')?.classList?.add('hidden')
  loginForm.addEventListener("submit", submitLogin);
}

const submitLogin = async function (e) {
  e.preventDefault()
  const formData = new FormData(document.getElementById('new_user'));
  const jsonFormData = JSON.stringify(Object.fromEntries(formData))
  log.debug(jsonFormData)

  const result = await api.getReviewToken(jsonFormData, formAuthUrl())
  log.debug(result)
  if (typeof (result.reviewToken) === 'undefined' || result.reviewToken === null) {
    renderAlert(result.message)
  } else {
    chrome.storage.local.set(result)
    hideAlerts()
    document.getElementById('new_user').classList.add('hidden')
    document.getElementById('new_review').classList.remove('hidden')
  }

  return false // fallback prevent submit
}

const submitReview = async function (e) {
  e.preventDefault()
  const formData = new FormData(document.getElementById('new_review'));
  const jsonFormData = JSON.stringify(Object.fromEntries(formData))
  log.debug(jsonFormData)

  // Close the popup
  // window.close()
  return setTimeout(window.close, 500, token)

  return false // fallback prevent submit
}

const hideAlerts = () => {
  const visibleAlerts = document.querySelectorAll(".alert.visible")
  log.debug(visibleAlerts)
  visibleAlerts.forEach(el=>el.classList.add('hidden'))
  visibleAlerts.forEach(el=>el.classList.add('visible'))
}

const renderAlert = (text, kind = "error") => {
  hideAlerts()
  const body = document.getElementById("body-popup")
  let alert = document.createElement("div")
  alert.textContent = text
  alert.classList.add(`alert-${kind}`, "alert", "my-4", "visible")
  body.prepend(alert)
}
