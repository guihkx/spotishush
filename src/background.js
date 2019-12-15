;(async () => {
  'use strict'

  browser.runtime.onMessage.addListener(messageHandler)

  function messageHandler (message, details) {
    return new Promise((resolve, reject) => {
      SpotiShush.debug('Got a message:', message)
      SpotiShush.debug('details:', details)

      const srcTab = details.tab

      SpotiShush.debug(
        'isTabMuted():',
        isTabMuted(srcTab),
        '| wasTabMutedByUs():',
        wasTabMutedByUs(srcTab)
      )

      switch (message.action) {
        case 'mute': {
          if (isTabMuted(srcTab)) {
            reject(new Error('Tab is already muted.'))
            return
          }
          muteTab(srcTab.id)
            .then((result) => {
              resolve(result)
            })
            .catch((error) => {
              SpotiShush.log(error.message)
              reject(new Error(error.message))
            })

          break
        }
        case 'unmute': {
          if (!isTabMuted(srcTab)) {
            reject(new Error('Tab is not muted.'))
            return
          }
          if (!wasTabMutedByUs(srcTab)) {
            reject(new Error('Tab was muted by the user.'))
            return
          }
          unMuteTab(srcTab.id)
            .then((result) => {
              resolve(result)
            })
            .catch((error) => {
              SpotiShush.log(error.message)
              reject(new Error(error.message))
            })

          break
        }
        default: {
          reject(new Error(`Unknown action: ${message.action}`))
          break
        }
      }
    })
  }

  function isTabMuted (tabInfo) {
    if ('mutedInfo' in tabInfo) {
      if ('muted' in tabInfo.mutedInfo) {
        return tabInfo.mutedInfo.muted
      }
    }
    return false
  }

  function wasTabMutedByUs (tabInfo) {
    if ('reason' in tabInfo.mutedInfo) {
      return tabInfo.mutedInfo.reason !== 'user'
    }
    return false
  }

  function unMuteTab (tabId) {
    return new Promise((resolve, reject) => {
      browser.tabs
        .update(tabId, {
          muted: false
        })
        .then((details) => {
          resolve(details)
        })
        .catch((error) => {
          reject(new Error(`Unable to unmute tab: ${error.message}`))
        })
    })
  }

  function muteTab (tabId) {
    return new Promise((resolve, reject) => {
      browser.tabs
        .update(tabId, {
          muted: true
        })
        .then((details) => {
          resolve(details)
        })
        .catch((error) => {
          reject(new Error(`Unable to mute tab: ${error.message}`))
        })
    })
  }
})()
