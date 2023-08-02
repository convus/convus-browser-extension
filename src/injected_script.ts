export default function injectedScript () {
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  const authUrl = process.env.baseUrl + '/browser_extension_auth'

  console.log('Convus extension is getting the page metadata!')

  // If on the extension auth URL, we only care about the two auth meta fields
  if (authUrl === window.location.href) {
    const authData = {
      // @ts-expect-error TS(2339): Property 'content' does not exist on type 'Element... Remove this comment to see the full error message
      currentName: document.querySelector('meta[name="ext-username"]')?.content,
      // @ts-expect-error TS(2339): Property 'content' does not exist on type 'Element... Remove this comment to see the full error message
      authToken: document.querySelector('meta[name="ext-token"]')?.content
    }
    return authData
  }
  // Convert an Attr to a [name, value] pair
  const attrToPair = (attr: any) => [attr.name, attr.value]
  // Convert an element to an object of its attributes, {key: value, ...}.
  // @ts-expect-error TS(2550): Property 'fromEntries' does not exist on type 'Obj... Remove this comment to see the full error message
  const elToAttrs = (el: any) => Object.fromEntries(Array.from(el.attributes).map(attrToPair))
  // Convert an iterable of elements to a list of element attributes
  const elsToAttrs = (els: any) => Array.from(els).map(elToAttrs)
  // Count the total words on the page
  const countWords = (str: any) => str?.trim()?.split(/\s+/)?.length || 0
  // Grab the JSON-LD data from the script elements, without parsing it
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  const jsonLdString = (scriptEls: any) => Array.from(scriptEls).map((i) => i.innerText.trim())

  let metadataAttrs = elsToAttrs(document.getElementsByTagName('meta'))

  // Add jsonLD - don't parse here, in case malformed
  const jsonLD = jsonLdString(document.querySelectorAll('script[type="application/ld+json"]'))
  if (jsonLD.length) {
    metadataAttrs = [...metadataAttrs, ...[{ json_ld: jsonLD }]]
  }

  // Calculate wordCount
  const commentsEl = document.querySelector('.comment-list-container') || document.querySelector('.comment-list') || document.querySelector('.commentlist')
  // Subtract comment words from the total
  // @ts-expect-error TS(2339): Property 'innerText' does not exist on type 'Eleme... Remove this comment to see the full error message
  const wordCount = { word_count: countWords(document.body.innerText) - countWords(commentsEl?.innerText) }

  return metadataAttrs.concat([wordCount])
}
