// Internal
const baseUrl = () => {
  return document.getElementById('body-popup').getAttribute('data-baseurl')
}

// Add a visual cue to show that you're attached to local
const renderLocalAlert = () => {
  // If alert is already rendered, skip
  if (document.getElementById('local-alert')) { return }
  if (baseUrl().match(/http:\/\/localhost/i)) {
    const localAlert = document.createElement('div')
    localAlert.textContent = 'local convus'
    localAlert.classList.add('text-gray-400', 'text-center')
    localAlert.setAttribute('id', 'local-alert')
    document.getElementById('body-popup').append(localAlert)
  }
}

const pageLoadedFunctions = () => {
  renderLocalAlert() // Render local alert if it's warranted
}

const hideAlerts = () => {
  const visibleAlerts = document.querySelectorAll('.alert')
  visibleAlerts.forEach(el => el.classList.add('hidden'))
  const visibleShares = document.querySelectorAll('.shareVisible')
  visibleShares.forEach(el => el.classList.add('hidden'))
}

// Internal
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

// Internal
const shareDiv = (shareText) => {
  const template = document.querySelector('#templates .shareTemplate')
  const el = template.cloneNode(true)
  el.classList.remove('shareTemplate')
  el.classList.add('shareVisible')
  el.setAttribute('data-sharetext', shareText)
  el.querySelector('.btnShare').addEventListener('click', copyShare)
  return el
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

// Not currently using - but want to remember how to do if necessary in the future
// const closePopup = () { window.close }

export default {
  hideAlerts,
  pageLoadedFunctions,
  renderAlerts,
  toggleMenu
}
