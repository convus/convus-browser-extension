import log from './log' // eslint-disable-line
import api from './api'
import utilities from './utilities'
import login from './login'

// Internal
const formNewRatingUrl = () => document.getElementById('new_rating')?.getAttribute('action')

// Internal
const handleRatingSubmit = async function (e) {
  e.preventDefault()
  const submitBtn = document.getElementById('ratingSubmitButton')
  submitBtn.classList.add('disabled')
  utilities.elementsShow('#rating-submit-spinner')
  const formData = new FormData(document.getElementById('new_rating'))
  const jsonFormData = JSON.stringify(Object.fromEntries(formData))
  const result = await api.submitRating(formNewRatingUrl(), window.authToken, jsonFormData)

  log.debug(result)
  utilities.renderAlerts(result.message, result.share)
  if (result.success) {
    document.getElementById('new_rating').classList.add('hidden')
    utilities.toggleMenu(false, 'hide')
  }
  utilities.elementsHide('#rating-submit-spinner')
  submitBtn.classList.remove('disabled')

  return false // fallback prevent submit
}

// Internal
const updateMenuCheck = (event) => {
  const el = event.target
  const targetField = document.getElementById(el.getAttribute('data-target-id'))
  utilities.elementsCollapse(targetField, el.checked ? 'show' : 'hide')
}

// Internal
const ratingTime = () => {
  log.trace('ratingTime')
  const ratingForm = document.getElementById('new_rating')

  if (utilities.retryIfMissing(ratingForm, ratingTime)) { return }

  // I think it's a good thing to attach the event listener to the rating form
  ratingForm.addEventListener('submit', handleRatingSubmit)
  // Attach the menu functionality
  document.getElementById('rating-menu-btn').addEventListener('click', utilities.toggleMenu)
  document.querySelectorAll('#rating-menu .form-control-check input').forEach(el => el.addEventListener('change', updateMenuCheck))
  document.getElementById('logout-btn').addEventListener('click', login.logout)

  showRatingForm()
  utilities.pageLoadedFunctions()
}

const showRatingForm = () => {
  log.trace('showRatingForm')
  // Only show or hide the form if authToken is set, in case of weird callback stuff
  if (window.authToken) {
    // If we're on the auth page, don't do anything
    if (login.isAuthUrl()) { return }
    // Hide the spinners
    utilities.elementsHide('.spinners, #whitespace-preserver')
    // Render save and menu
    utilities.elementsShow('#rating-save-row')
    utilities.elementsShow('#new_rating')
  }
  // Nice to have username to keep track of what's going on
  if (window.currentName) {
    document.getElementById('username').textContent = window.currentName
  }
}

const updateRatingFields = (tabUrl, title) => {
  log.trace('updateRatingFields')
  const ratingUrlField = document.getElementById('submitted_url')
  utilities.retryIfMissing(ratingUrlField, updateRatingFields, tabUrl, title)

  ratingUrlField.value = tabUrl
  document.getElementById('citation_title').value = title
  document.getElementById('timezone').value = Intl.DateTimeFormat().resolvedOptions().timeZone
  ratingTime()
}

const addMetadata = (metadata) => {
  log.debug(`addMetadata, metadata length: ${metadata?.length}`)
  const citationMetadataField = document.getElementById('citation_metadata_str')
  utilities.retryIfMissing(citationMetadataField, addMetadata, metadata)
  document.getElementById('citation_text').value = metadata.articleText
  // This could use destructuring, but it's a bit more readable this way
  delete metadata.articleText
  citationMetadataField.value = JSON.stringify(metadata)
}

export default {
  addMetadata,
  showRatingForm,
  updateRatingFields
}
