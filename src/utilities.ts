import log from './log' // eslint-disable-line

// pause and rerun if DOM hasn't loaded
const retryIfMissing = (obj: any, func: any, ...args: any[]) => {
  if (typeof (obj) === 'undefined' || obj === null) {
    log.debug(`${func.name} requires an element not present in DOM, trying again in 50ms`)
    setTimeout(func, 50, ...args)
    return true
  }
}

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
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
    // @ts-expect-error TS(2531): Object is possibly 'null'.
    document.getElementById('body-popup').append(localAlert)
  }
}

const pageLoadedFunctions = () => {
  renderLocalAlert() // Render local alert if it's warranted
}

// Internal
const elementsFromSelectorOrElements = (selOrEl: any) => {
  if (typeof (selOrEl) === 'string') {
    return document.querySelectorAll(selOrEl)
  } else {
    // @ts-expect-error TS(2550): Property 'flat' does not exist on type 'any[]'. Do... Remove this comment to see the full error message
    return [selOrEl].flat()
  }
}

const elementsHide = (selOrEl: any) => {
  elementsFromSelectorOrElements(selOrEl)
    .forEach((el: any) => el.classList.add('hidden'))
}

const elementsShow = (selOrEl: any) => {
  elementsFromSelectorOrElements(selOrEl)
    .forEach((el: any) => el.classList.remove('hidden'))
}

// toggle can be: [true, 'hide', 'show']
const elementsCollapse = (selOrEl: any, toggle = true) => {
  const els = elementsFromSelectorOrElements(selOrEl)
  // log.trace(`toggling: ${toggle}`)
  // If toggling, determine which direction to toggle
  if (toggle === true) {
    // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'boolean'.
    toggle = els[0]?.classList.contains('hidden') ? 'show' : 'hide'
  }
  // TODO: add animation functionality
  // @ts-expect-error TS(2367): This condition will always return 'false' since th... Remove this comment to see the full error message
  if (toggle === 'show') {
    els.forEach((el: any) => el.classList.remove('hidden'))
  } else {
    els.forEach((el: any) => el.classList.add('hidden'))
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
const copyShare = (event: any) => {
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
const shareDiv = (shareText: any) => {
  const template = document.querySelector('#templates .shareTemplate')
  // @ts-expect-error TS(2531): Object is possibly 'null'.
  const el = template.cloneNode(true)
  // @ts-expect-error TS(2339): Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
  el.classList.remove('shareTemplate')
  // @ts-expect-error TS(2339): Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
  el.classList.add('shareVisible')
  // @ts-expect-error TS(2339): Property 'setAttribute' does not exist on type 'No... Remove this comment to see the full error message
  el.setAttribute('data-sharetext', shareText)
  // @ts-expect-error TS(2339): Property 'querySelector' does not exist on type 'N... Remove this comment to see the full error message
  el.querySelector('.btnShare').addEventListener('click', copyShare)
  return el
}
// Internal
const renderAlert = (kind: any, text: any, shareText: any) => {
  const body = document.getElementById('body-popup')
  const alert = document.createElement('div')
  alert.textContent = text
  alert.classList.add(`alert-${kind}`, 'alert', 'my-4')
  // @ts-expect-error TS(2531): Object is possibly 'null'.
  body.prepend(alert)

  if (typeof (shareText) !== 'undefined' && shareText !== null) {
    alert.after(shareDiv(shareText))
  }
}

// message is an array of: [kind, text]
const renderAlerts = (messages: any, shareText = null) => {
  hideAlerts()
  // Wrap messages if messages is just a single message
  if (typeof (messages[0]) === 'string') { messages = [messages] }
  messages.forEach((m: any) => renderAlert(m[0], m[1], shareText))
}

// toggle: [true, 'hide', 'show'] - matches elementsCollapse above
const toggleMenu = (event = false, toggle = true) => {
  // @ts-expect-error TS(2339): Property 'preventDefault' does not exist on type '... Remove this comment to see the full error message
  event && event.preventDefault()
  const menuBtn = document.getElementById('rating-menu-btn')
  const menu = document.getElementById('rating-menu')
  // Choose toggle based on state of button, if toggling
  if (toggle === true) {
    // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'boolean'.
    toggle = menuBtn.classList.contains('active') ? 'hide' : 'show'
  }
  elementsCollapse(menu, toggle)

  // @ts-expect-error TS(2367): This condition will always return 'false' since th... Remove this comment to see the full error message
  if (toggle === 'hide') {
    // @ts-expect-error TS(2531): Object is possibly 'null'.
    menuBtn.classList.remove('active')
  } else {
    // @ts-expect-error TS(2531): Object is possibly 'null'.
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
