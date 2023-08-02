import log from './log' // eslint-disable-line
import api from './api'
import utilities from './utilities'
import login from './login'

// Internal
const formNewRatingUrl = () => document.getElementById('new_rating')?.getAttribute('action')

// Internal
const handleRatingSubmit = async function (e: any) {
  e.preventDefault()
  const submitBtn = document.getElementById('ratingSubmitButton')
  // @ts-expect-error TS(2531): Object is possibly 'null'.
  submitBtn.classList.add('disabled')
  utilities.elementsShow('#rating-submit-spinner')
  // @ts-expect-error TS(2345): Argument of type 'HTMLElement | null' is not assig... Remove this comment to see the full error message
  const formData = new FormData(document.getElementById('new_rating'))
  // @ts-expect-error TS(2550): Property 'fromEntries' does not exist on type 'Obj... Remove this comment to see the full error message
  const jsonFormData = JSON.stringify(Object.fromEntries(formData))
  // @ts-expect-error TS(2339): Property 'authToken' does not exist on type 'Windo... Remove this comment to see the full error message
  const result = await api.submitRating(formNewRatingUrl(), window.authToken, jsonFormData)

  log.debug(result)
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  utilities.renderAlerts(result.message, result.share)
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  if (result.success) {
    // @ts-expect-error TS(2531): Object is possibly 'null'.
    document.getElementById('new_rating').classList.add('hidden')
    // @ts-expect-error TS(2345): Argument of type '"hide"' is not assignable to par... Remove this comment to see the full error message
    utilities.toggleMenu(false, 'hide')
  }
  utilities.elementsHide('#rating-submit-spinner')
  // @ts-expect-error TS(2531): Object is possibly 'null'.
  submitBtn.classList.remove('disabled')

  return false // fallback prevent submit
}

// Internal
const updateMenuCheck = (event: any) => {
  const el = event.target
  const targetField = document.getElementById(el.getAttribute('data-target-id'))
  // @ts-expect-error TS(2345): Argument of type '"hide" | "show"' is not assignab... Remove this comment to see the full error message
  utilities.elementsCollapse(targetField, el.checked ? 'show' : 'hide')
}

// Internal
const ratingTime = () => {
  log.trace('ratingTime')
  const ratingForm = document.getElementById('new_rating')

  if (utilities.retryIfMissing(ratingForm, ratingTime)) { return }

  // I think it's a good thing to attach the event listener to the rating form
  // @ts-expect-error TS(2531): Object is possibly 'null'.
  ratingForm.addEventListener('submit', handleRatingSubmit)
  // Attach the menu functionality
  // @ts-expect-error TS(2531): Object is possibly 'null'.
  document.getElementById('rating-menu-btn').addEventListener('click', utilities.toggleMenu)
  document.querySelectorAll('#rating-menu .form-control-check input').forEach(el => el.addEventListener('change', updateMenuCheck))
  // @ts-expect-error TS(2531): Object is possibly 'null'.
  document.getElementById('logout-btn').addEventListener('click', login.logout)

  showRatingForm()
  utilities.pageLoadedFunctions()
}

const showRatingForm = () => {
  log.trace('showRatingForm')
  // Only show or hide the form if authToken is set, in case of weird callback stuff
  // @ts-expect-error TS(2339): Property 'authToken' does not exist on type 'Windo... Remove this comment to see the full error message
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
  // @ts-expect-error TS(2339): Property 'currentName' does not exist on type 'Win... Remove this comment to see the full error message
  if (window.currentName) {
    // @ts-expect-error TS(2531): Object is possibly 'null'.
    document.getElementById('username').textContent = window.currentName
  }
}

const updateRatingFields = (tabUrl: any, title: any) => {
  log.trace('updateRatingFields')
  const ratingUrlField = document.getElementById('submitted_url')
  utilities.retryIfMissing(ratingUrlField, updateRatingFields, tabUrl, title)

  // @ts-expect-error TS(2531): Object is possibly 'null'.
  ratingUrlField.value = tabUrl
  // @ts-expect-error TS(2531): Object is possibly 'null'.
  document.getElementById('citation_title').value = title
  // @ts-expect-error TS(2531): Object is possibly 'null'.
  document.getElementById('timezone').value = Intl.DateTimeFormat().resolvedOptions().timeZone
  ratingTime()
}

const addMetadata = (metadata: any) => {
  log.debug(`addMetadata, metadata length: ${metadata?.length}`)
  const citationMetadataField = document.getElementById('citation_metadata_str')
  utilities.retryIfMissing(citationMetadataField, addMetadata, metadata)
  // @ts-expect-error TS(2531): Object is possibly 'null'.
  citationMetadataField.value = JSON.stringify(metadata)
}

export default {
  addMetadata,
  showRatingForm,
  updateRatingFields
}
