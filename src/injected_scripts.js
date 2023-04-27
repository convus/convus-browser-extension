// NOTE: the function that's passed into executeScript must be self contained -
//       it can't reference other things (e.g. other functions in this file)
const getPageData = (isAuthUrl = false) => {
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

  const countWords = (str) => str.trim().split(/\s+/).length

  metadataAttrs = elsToAttrs(document.getElementsByTagName('meta'))
  wordCount = {word_count: countWords(document.body.textContent)}

  // Add jsonLD - don't parse here, in case malformed
  jsonLD = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((i) => i.innerText.trim())
  if (jsonLD.length) {
    metadataAttrs = metadataAttrs.concat([{json_ld: jsonLD}])
  }
  return metadataAttrs.concat([wordCount])
}

export default {
  getPageData
}


// TODO:
//
// rel="tags" - https://hakaimagazine.com/news/the-toxic-threat-in-thawing-permafrost/
// https://microformats.org/wiki/rel-tag
// wtf - https://pluralistic.net/
//
