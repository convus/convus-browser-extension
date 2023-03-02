// Called when the user clicks on the action.
chrome.action.onClicked.addListener(function (tab) {
  // No tabs or host permissions needed!
  console.log('Turning ' + tab.url + ' red!')

  // chrome.scripting.executeScript({
  //   code: 'document.body.style.backgroundColor="red"'
  // });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: contentScriptFunc,
    args: ['action']
  })
})

function contentScriptFunc (name) {
  alert(`"${name}" executed`)
}

// This callback WILL NOT be called for "_execute_action"
chrome.commands.onCommand.addListener((command) => {
  console.log(`Command "${command}" called`)
})
