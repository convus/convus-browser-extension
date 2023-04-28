// NOTE: the function that's passed into executeScript must be self contained -
//       it can't reference other things (e.g. other functions in this file)

// (function() {
export default function getPageData () {
  const baseUrl = process.env.baseUrl + '/browser_extension_auth'
  const isAuthUrl = baseUrl === window.location.href

  // If it's auth data, we only care about the two auth meta fields
  if (isAuthUrl) {
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
  // Grab the JSON-LD data (skip parsing it)
  const jsonLdScripts = (els) => Array.from(els).map((i) => i.innerText.trim())

  console.log('running on the page!')

  let metadataAttrs = elsToAttrs(document.getElementsByTagName('meta'))
  const wordCount = { word_count: countWords(document.body.textContent) }

  // Add jsonLD - don't parse here, in case malformed
  const jsonLD = jsonLdScripts(document.querySelectorAll('script[type="application/ld+json"]'))
  if (jsonLD.length) {
    metadataAttrs = [...metadataAttrs, ...[{ json_ld: jsonLD }]]
  }

  return metadataAttrs.concat([wordCount])
}
// })
