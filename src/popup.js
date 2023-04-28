import log from './log' // eslint-disable-line
import login from './login'
import rating from './rating'
import injectedScript from './injected_script'

// instantiating these outside functions prevents a periodic "process is undefined" bug
const browserTarget = process.env.browser_target
const safariType = !!browserTarget.match("safari") // get safari_ios too

// Oh Chrome, it would be great if you used `browser` instead of `chrome`
if (browserTarget == 'chrome') { browser = chrome } // eslint-disable-line

browser.storage.local.get(['authToken', 'currentName'])
  .then(data => {
    if (typeof (data.authToken) === 'undefined' || data.authToken === null) {
      log.debug(`missing auth!   authToken: ${data.authToken} and currentName: ${data.currentName}`)
      login.loginTime()
    } else {
      log.trace('auth present')
      window.authToken = data.authToken
      window.currentName = data.currentName
      login.checkAuthToken(data.authToken)
    }
  })

const getPageData = () => {
  const authUrl = '{{baseUrl}}/browser_extension_auth'

  console.log('Convus extension is getting the page metadata!')

  // If on the extension auth URL, we only care about the two auth meta fields
  if (authUrl === window.location.href) {
    const authData = {
      currentName: document.querySelector('meta[name="ext-username"]')?.content,
      authToken: document.querySelector('meta[name="ext-token"]')?.content
    }
    return authData
  }
  // Convert an Attr to a [name, value] pair
  const attrToPair = (attr) => [attr.name, attr.value]
  // Convert an element to an object of its attributes, {key: value, ...}.
  const elToAttrs = (el) => Object.fromEntries(Array.from(el.attributes).map(attrToPair))
  // Convert an iterable of elements to a list of element attributes
  const elsToAttrs = (els) => Array.from(els).map(elToAttrs)
  // Count the total words on the page
  const countWords = (str) => str.trim().split(/\s+/).length
  // Grab the JSON-LD data from the script elements, without parsing it
  const jsonLdString = (scriptEls) => Array.from(scriptEls).map((i) => i.innerText.trim())

  let metadataAttrs = elsToAttrs(document.getElementsByTagName('meta'))
  const wordCount = { word_count: countWords(document.body.textContent) }

  // Add jsonLD - don't parse here, in case malformed
  const jsonLD = jsonLdString(document.querySelectorAll('script[type="application/ld+json"]'))
  if (jsonLD.length) {
    metadataAttrs = [...metadataAttrs, ...[{ json_ld: jsonLD }]]
  }

  return metadataAttrs.concat([wordCount])
}

const getCurrentTab = async function () {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  // log.debug(tab)

  // Assign these things to window so they can be accessed other places
  window.currentUrl = tab.url
  const isAuthUrl = login.isAuthUrl(tab.url)
  window.tabId = tab.id

  if (login.isSignInOrUpUrl(window.currentUrl)) {
    // If the user is signing in/up to Convus, don't inject a script
    log.debug('Viewing Convus sign in or up')
    return
  } else if (!isAuthUrl) {
    // Update rating fields that we have info for, the metadata can be added later
    rating.updateRatingFields(window.currentUrl, tab.title)
  }

  // const scriptSource = safariType ? '/injected_script.js' : '/injected_script.js'
  // log.debug(scriptSource)

  await browser.scripting.executeScript({
    target: { tabId: tab.id },
    // files: [scriptSource]
    func: injectedScript
  })
    .then(response => {
      log.debug('Script response: ', response)
      const result = safariType ? response[0] : response[0].result
      if (isAuthUrl) {
        login.loginFromAuthPageData(result.authToken, result.currentName)
      } else {
        rating.addMetadata(result)
      }
    })
}

getCurrentTab()
