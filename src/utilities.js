import log from './log' // eslint-disable-line

// pause and rerun if DOM hasn't loaded
const retryIfMissing = (obj, func, ...args) => {
  if (typeof (obj) === 'undefined' || obj === null) {
    log.debug(`${func.name} requires an element not present in DOM, trying again in 50ms`)
    setTimeout(func, 50, ...args)
    return true
  }
}

const baseUrl = process.env.baseUrl

// Add a visual cue to show that you're attached to local
const renderLocalAlert = () => {
  // If alert is already rendered, skip
  if (document.getElementById('local-alert')) { return }
  if (baseUrl.match(/http:\/\/localhost/i)) {
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

// Internal
const elementsFromSelectorOrElements = (selOrEl) => {
  if (typeof (selOrEl) === 'string') {
    return document.querySelectorAll(selOrEl)
  } else {
    return [selOrEl].flat()
  }
}

const elementsHide = (selOrEl) => {
  elementsFromSelectorOrElements(selOrEl)
    .forEach(el => el.classList.add('hidden'))
}

const elementsShow = (selOrEl) => {
  elementsFromSelectorOrElements(selOrEl)
    .forEach(el => el.classList.remove('hidden'))
}

// toggle can be: [true, 'hide', 'show']
const elementsCollapse = (selOrEl, toggle = true) => {
  const els = elementsFromSelectorOrElements(selOrEl)
  // log.trace(`toggling: ${toggle}`)
  // If toggling, determine which direction to toggle
  if (toggle === true) {
    toggle = els[0]?.classList.contains('hidden') ? 'show' : 'hide'
  }
  // TODO: add animation functionality
  if (toggle === 'show') {
    els.forEach(el => el.classList.remove('hidden'))
  } else {
    els.forEach(el => el.classList.add('hidden'))
  }
}

const hideAlerts = () => {
  // TODO: switch to (and test):
  // elementsHide('.alert, .shareVisible')
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
  // log.trace(`copyShare: ${shareText}`)
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
// Internal
const renderAlert = (kind, text, shareText) => {
  const body = document.getElementById('body-popup')
  const alert = document.createElement('div')
  alert.textContent = text
  alert.classList.add(`alert-${kind}`, 'alert', 'my-4')
  body.prepend(alert)

  if (typeof (shareText) !== 'undefined' && shareText !== null) {
    alert.after(shareDiv(shareText))
  }
}

// message is an array of: [kind, text]
const renderAlerts = (messages, shareText = null) => {
  hideAlerts()
  // Wrap messages if messages is just a single message
  if (typeof(messages[0]) === "string") { messages = [messages] }
  messages.forEach(m => renderAlert(m[0], m[1], shareText))
}

// toggle: [true, 'hide', 'show'] - matches elementsCollapse above
const toggleMenu = (event = false, toggle = true) => {
  event && event.preventDefault()
  const menuBtn = document.getElementById('rating-menu-btn')
  const menu = document.getElementById('rating-menu')
  // Choose toggle based on state of button, if toggling
  if (toggle === true) {
    toggle = menuBtn.classList.contains('active') ? 'hide' : 'show'
  }
  elementsCollapse(menu, toggle)

  if (toggle === 'hide') {
    menuBtn.classList.remove('active')
  } else {
    menuBtn.classList.add('active')
  }
}

export default {
  elementsCollapse,
  elementsHide,
  elementsShow,
  hideAlerts,
  pageLoadedFunctions,
  renderAlerts,
  retryIfMissing,
  toggleMenu
}
