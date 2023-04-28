(function () {
  const authUrl = 'http://localhost:3009/browser_extension_auth'

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
})()

console.log("HHHHfffffff9999999")
