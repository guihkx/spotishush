'use strict'

// Quick polyfill. Tested on Firefox and Chrome.
const BROWSER = typeof browser === 'undefined' ? chrome : browser

BROWSER.runtime.onMessage.addListener(muteOrUnmute)

function muteOrUnmute (message, sender, sendResponse) {
  const wantsToMute = message.action === 'mute'
  const isMuted = sender.tab.mutedInfo.muted
  const mutedByUser = sender.tab.mutedInfo.reason === 'user'

  const response = {
    ok: false,
    text: '',
    details: sender.tab.mutedInfo,
    dontLog: message.dontLog
  }
  // Check if the desired action will actually change the tab state.
  // Otherwise, we don't do anything.
  if ((wantsToMute && isMuted) || (!wantsToMute && !isMuted)) {
    response.text = `Warning: This tab is already ${message.action}d, not doing anything`
    sendResponse(response)
    return true
  }
  // Prevents us from unmuting a tab muted on purpose by the user.
  if (!wantsToMute && isMuted && mutedByUser) {
    response.text = 'Error: This tab was muted by the user, refusing to unmute it'
    sendResponse(response)
    return true
  }
  // Everything is ok, update the tab's state.
  BROWSER.tabs.update(sender.tab.id, { muted: wantsToMute }, () => {
    if (BROWSER.runtime.lastError) {
      response.text = `Error: ${BROWSER.runtime.lastError.message}`
      response.details = sender.tab
    } else {
      response.ok = true
    }
    sendResponse(response)
  })
  return true
}
