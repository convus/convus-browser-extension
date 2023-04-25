// NOTE: the function that's passed into executeScript must be self contained -
//       it can't reference other things (e.g. other functions here)
const metaAttributes = (isAuthUrl = false) => {
  // Convert an Attr to a [name, value] pair
  const attrToPair = (attr) => [attr.name, attr.value]
  // Convert an element to an object of its attributes, {key: value, ...}.
  const elToAttrs = (el) => Object.fromEntries(Array.from(el.attributes).map(attrToPair))
  // Convert an iterable of elements to a list of element attributes
  const elsToAttrs = (els) => Array.from(els).map(elToAttrs)

  const elements = isAuthUrl ? document.querySelectorAll('meta[name="ext-token"], meta[name="ext-username"]') : document.getElementsByTagName('meta')
  return elsToAttrs(elements)
}

// Takes the metAttributes response from isAuthUrl, returns {currentName: currentName, authToken: authToken}
const resultToAuthData = (arr) => {
  const metaKey = (name) => name === 'ext-username' ? 'currentName' : 'authToken'
  const keypairs = arr.map(el => [metaKey(el.name), el.content])
  return Object.fromEntries(keypairs)
}

export default {
  metaAttributes,
  resultToAuthData
}
