import log from './log' // eslint-disable-line
import api from './api'
import utilities from './utilities'
// only importing login for loginTime - shouldn't import the rest :/
import login from './login'

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

// Internal
const formNewRatingUrl = () => document.getElementById('new_rating')?.getAttribute('action')

const ratingTime = () => {
  const ratingForm = document.getElementById('new_rating')
  if (typeof (ratingForm) === 'undefined' || ratingForm === null) {
    log.debug('rating form not present in DOM, trying again in 50ms')
    return setTimeout(ratingTime, 50)
  }
  // I think it's a good thing to attach the event listener to the rating form
  ratingForm.addEventListener('submit', handleRatingSubmit)
  // Attach the menu functionality
  document.getElementById('rating-menu-btn').addEventListener('click', utilities.toggleMenu)
  document.querySelectorAll('#rating-menu .form-control-check input').forEach(el => el.addEventListener('change', updateMenuCheck))
  document.getElementById('logout-btn').addEventListener('click', login.logout)
  // ... but only show or hide the form if authToken is set, in case of weird callback stuff
  if (window.authToken) {
    document.getElementById('new_user').classList.add('hidden')
    ratingForm.classList.remove('hidden')
  }
  // not required, just nice to have username to keep track of what's going on
  if (window.currentName) {
    document.getElementById('username').textContent = window.currentName
  }
  utilities.pageLoadedFunctions()
}

// Internal
const handleRatingSubmit = async function (e) {
  e.preventDefault()
  const formData = new FormData(document.getElementById('new_rating'))
  const jsonFormData = JSON.stringify(Object.fromEntries(formData))
  const result = await api.submitRating(formNewRatingUrl(), window.authToken, jsonFormData)

  log.debug(result)
  utilities.renderAlerts(result.message, result.share)
  if (result.success) {
    document.getElementById('new_rating').classList.add('hidden')
    utilities.toggleMenu(false, true)
  }

  return false // fallback prevent submit
}

// Internal
const updateMenuCheck = (event) => {
  const el = event.target
  const fieldId = el.getAttribute('data-target-id')

  if (el.checked) {
    document.getElementById(fieldId).classList.remove('hidden')
  } else {
    document.getElementById(fieldId).classList.add('hidden')
  }
}

export default {
  ratingTime,
  updateRatingFields
}