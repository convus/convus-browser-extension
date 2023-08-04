import log from './log' // eslint-disable-line
import api from './api'
import utilities from './utilities'
import login from './login'

// Internal
const formNewRatingUrl = () => document.getElementById('new_rating')?.getAttribute('action')

// Internal
const ratingCheckboxes = ["changed_opinion", "significant_factual_error", "learned_something", "not_understood", "not_finished"]

// Internal
const submitRating = async function() {
  const formData = new FormData(document.getElementById('new_rating'))
  const jsonFormData = JSON.stringify(Object.fromEntries(formData))
  return await api.postRating(formNewRatingUrl(), window.authToken, jsonFormData)
}

// Internal
const handleRatingSubmit = async function(e) {
  e.preventDefault()
  const submitBtn = document.getElementById('ratingSubmitButton')
  submitBtn.classList.add('disabled')
  utilities.elementsShow('#rating-submit-spinner')
  const result = await submitRating()

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
const backgroundRatingUpdate = async function() {
  if (window.ratingDataLoaded && window.metadataLoaded) {
    result = await submitRating()
    log.debug(result)
  }
  true
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

const updateBasicRatingFields = (tabUrl, title) => {
  log.trace('updateBasicRatingFields')
  const ratingUrlField = document.getElementById('submitted_url')
  utilities.retryIfMissing(ratingUrlField, updateBasicRatingFields, tabUrl, title)

  ratingUrlField.value = tabUrl
  document.getElementById('citation_title').value = title
  document.getElementById('timezone').value = Intl.DateTimeFormat().resolvedOptions().timeZone
  ratingTime()
}

// Internal
const updateAdditionalRatingFields = (ratingAttrs) => {
  log.trace('updateAdditionalRatingFields')
  log.debug(ratingAttrs)
  const ratingUrlField = document.getElementById('submitted_url')
  utilities.retryIfMissing(ratingUrlField, updateAdditionalRatingFields, ratingAttrs)
  // Only update quality if it's not the default
  if (ratingAttrs.quality !== "quality_med") {
    document.getElementById(`quality_${ratingAttrs.quality}`).checked = true
  }
  ratingCheckboxes.filter((field) => ratingAttrs[field])
    .forEach((field) => document.getElementById(field).checked = true)
  window.ratingDataLoaded = true
  // Add event listener to all the checkboxes
  ratingCheckboxes.forEach((field) => document.getElementById(field).addEventListener('change', backgroundRatingUpdate))
}

const loadRemoteRatingData = async (tabUrl) => {
  const result = await api.getRating(formNewRatingUrl(), window.authToken, tabUrl)
  log.debug(`rating result: ${JSON.stringify(result)}`)
  if (result.success) {
    updateAdditionalRatingFields(result.data)
  }
}

const addMetadata = (metadata) => {
  log.debug(`addMetadata, metadata length: ${metadata?.length}`)
  const citationMetadataField = document.getElementById('citation_metadata_str')
  utilities.retryIfMissing(citationMetadataField, addMetadata, metadata)
  citationMetadataField.value = JSON.stringify(metadata)
  window.metadataLoaded = true
}

export default {
  addMetadata,
  showRatingForm,
  updateBasicRatingFields,
  loadRemoteRatingData
}
