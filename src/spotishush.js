'use strict'

// Quick polyfill. Tested on Firefox and Chrome.
const BROWSER = typeof browser === 'undefined' ? chrome : browser
const ADDON_NAME = BROWSER.runtime.getManifest().name
const ADDON_VERSION = BROWSER.runtime.getManifest().version
const CURRENT_SITE = window.location.hostname
// Supported services.
const SITES = {
  'www.deezer.com': {
    name: 'Deezer',
    log_css: 'color: #fa8914; font-weight: bold',
    init: deezerInit
  },
  'open.spotify.com': {
    name: 'Spotify',
    log_css: 'color: #1db954; font-weight: bold',
    init: spotifyInit
  },
  'app.idagio.com': {
    name: 'IDAGIO',
    log_css: 'background: #fff; color: #000; font-weight: bold',
    init: idagioInit
  },
  'zvuk.com': {
    name: 'Zvuk',
    log_css: 'background: #fff; color: #000; font-weight: bold',
    init: zvukInit
  }
}

// Wrapper for console.log(), with pretty colors. :D
const LOG = console.log.bind(
  console,
  `%c[${ADDON_NAME} v${ADDON_VERSION}]%c %c[${SITES[CURRENT_SITE].name}]`,
  'background: #000; color: #1db954; font-weight: bold',
  'background: none',
  SITES[CURRENT_SITE].log_css
)

;(() => {
  LOG('Initialized.')

  // The current tab might be muted, try to unmute it first.
  sendToBg({
    action: 'unmute',
    dontLog: true
  })

  // Call the specific init function for this site.
  SITES[CURRENT_SITE].init()
})()

// Send messages to `background.js`.
function sendToBg (message) {
  BROWSER.runtime.sendMessage(message, receiveFromBg)
}

// Receive messages from `background.js`.
function receiveFromBg (response) {
  if (response.dontLog) {
    return
  }
  if (response.ok) {
    LOG('Done.')
  } else {
    LOG(`${response.text}. Details:`, response.details)
  }
}

async function deezerInit () {
  LOG('Waiting for ad control element to load...')
  // This <div> (with no attributes) is inside the first <div> (also with no attributes) in #page_content.
  // The selector is purposely specific because this <div> is lazy-loaded, which can give us wrong matches.
  const adControlElement = await lazySelector('#page_content > div:not([class], [id], [style]):nth-child(1) > div:not([class], [id], [style])')
  deezerSetupAdsObserver(adControlElement)
  LOG('Monitoring ads now!')
}

async function spotifyInit () {
  LOG('Waiting for player controls to be ready...')
  const nowPlayingBar = await lazySelector(
    '[data-testid=now-playing-bar]'
  )
  spotifySetupAdsObserver(nowPlayingBar)
  LOG('Monitoring ads now!')
}

async function idagioInit () {
  LOG('Waiting for progress bar to be ready...')
  const progressBar = await lazySelector('input#input-handle')
  idagioSetupAdsObserver(progressBar)
  LOG('Monitoring ads now!')
}

async function zvukInit () {
  LOG('Waiting for player controls to be ready...')
  const addToFavoritesButton = await lazySelector(
    'button[class*=styles_btnAdd__]'
  )
  zvukSetupAdsObserver(addToFavoritesButton)
  LOG('Monitoring ads now!')
}

function lazySelector (selector) {
  return new Promise(resolve => {
    const id = setInterval(() => {
      const element = document.querySelector(selector)
      if (element !== null) {
        clearInterval(id)
        resolve(element)
      }
    }, 500)
  })
}

// Deezer's ad detection method:
// Observe children mutations in the first <div> element with no attributes in #page_content.
// If it's an ad, the first child element of that <div> will be an <audio>.
function deezerSetupAdsObserver (adControlElement) {
  const mo = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const addedNode of mutation.addedNodes) {
        if (addedNode instanceof HTMLAudioElement) {
          LOG('Ad detected in our song queue, muting tab...')
          sendToBg({ action: 'mute' })
          return
        }
      }
      for (const removedNode of mutation.removedNodes) {
        if (removedNode instanceof HTMLAudioElement) {
          LOG('Not an ad in our song queue, unmuting tab...')
          sendToBg({ action: 'unmute' })
          return
        }
      }
    }
  })
  mo.observe(adControlElement, {
    childList: true
  })
  return mo
}

// Spotify's ad detection method:
// Observe attribute mutations on Spotify player controls.
function spotifySetupAdsObserver (nowPlayingBar) {
  const mo = new MutationObserver(() => {
    if (nowPlayingBar.getAttribute('data-testadtype') !== 'ad-type-none') {
      LOG('Ad detected in our song queue, muting tab...')
      sendToBg({ action: 'mute' })
    } else {
      LOG('Not an ad in our song queue, unmuting tab...')
      sendToBg({ action: 'unmute' })
    }
  })
  mo.observe(nowPlayingBar, {
    attributes: true
  })
  return mo
}

function idagioSetupAdsObserver (progressBar) {
  const mo = new MutationObserver(mutations => idagioHandleAd(mutations[0].target))
  mo.observe(progressBar, {
    childList: false,
    attributes: true,
    attributeFilter: ['disabled']
  })
  // IDAGIO ads persist through page reloads.
  // Our MutationObserver function is not triggered after the page loads.
  // Do a single manual check.
  idagioHandleAd(progressBar)
  return mo
}

function idagioHandleAd (progressBar) {
  if (progressBar.disabled) {
    LOG('Ad detected in our song queue, muting tab...')
    sendToBg({ action: 'mute' })
  } else {
    LOG('Not an ad in our song queue, unmuting tab...')
    sendToBg({ action: 'unmute' })
  }
}

// Zvuk's ad detection method:
// Observe attribute mutations on the plus button (a.k.a. "add to favorites") in player controls.
function zvukSetupAdsObserver (addToFavoritesButton) {
  const mo = new MutationObserver(() => {
    if (addToFavoritesButton.disabled) {
      LOG('Ad detected in our song queue, muting tab...')
      sendToBg({ action: 'mute' })
    } else {
      LOG('Not an ad in our song queue, unmuting tab...')
      sendToBg({ action: 'unmute' })
    }
  })
  mo.observe(addToFavoritesButton, {
    attributes: true
  })
  return mo
}
