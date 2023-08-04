export default function injectedScript() {
  const authUrl = process.env.baseUrl + '/browser_extension_auth'

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
  // Grab the JSON-LD data from the script elements, without parsing it
  const jsonLdString = (scriptEls) => Array.from(scriptEls).map((i) => i.innerText.trim())

  let metadataAttrs = elsToAttrs(document.getElementsByTagName('meta'))

  // Add jsonLD - don't parse here, in case malformed
  const jsonLD = jsonLdString(document.querySelectorAll('script[type="application/ld+json"]'))
  if (jsonLD.length) {
    metadataAttrs = [...metadataAttrs, ...[{ json_ld: jsonLD }]]
  }

  // Get articleText
  let articleText = document.querySelector('body').innerText
  // List of selectors for things that we don't want to include in articleText
  const nonArticleSelectors = ['nav', 'header', 'footer', '#disqus_thread',
    '.GoogleActiveViewElement', '.hide-for-print']
  // Get all the nonArticleSelectors elements, remove any text matching the text of those elements
  Array.from(document.querySelectorAll(nonArticleSelectors))
    .forEach(function(t) { articleText = articleText.replaceAll(t.innerText, '') })
  // A lot of these can be included, so remove them
  articleText = articleText.replaceAll('\\nADVERTISEMENT\\n', '\n')
  return metadataAttrs.concat([{ citation_text: articleText }])
}
