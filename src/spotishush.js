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
  'listen.tidal.com': {
    name: 'TIDAL',
    log_css: 'background: #fff; color: #000; font-weight: bold',
    init: tidalInit
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

function deezerInit () {
  // Deezer has their own ad-related events.
  // Their names can be found in the `window.Events.ads` object.
  const knownEvents = {
    // `window.Events.ads.adBegin`:
    // Unfortunately, by the time this event is fired, Deezer already has the ad
    // pre-buffered and ready to play. Sometimes, Deezer will even play the ad
    // before we can mute the tab. In comparison, the ad detection method in
    // deezerSetupAdsObserver() can be 200~600ms faster.
    // This is just a redundancy, in case deezerSetupAdsObserver() fails.
    sasVideoStart: () => {
      LOG('[Fallback] Ad detected in our song queue, muting tab...')
      sendToBg({
        action: 'mute',
        dontLog: true
      })
    },
    // `window.Events.ads.adEnd`:
    sasVideoEnd: () => {
      LOG('Ad has ended, unmuting tab...')
      sendToBg({ action: 'unmute' })
    },
    // `window.Events.ads.adError`:
    adError: () => {
      LOG('Ad error, unmuting tab...')
      sendToBg({ action: 'unmute' })
    }
  }
  deezerSetupAdsObserver()
  // Hook into Deezer's own events.
  for (const event in knownEvents) {
    window.addEventListener(event, knownEvents[event])
  }
  LOG('Monitoring ads now!')
}

async function spotifyInit () {
  LOG('Waiting for player controls to be ready...')
  const nowPlayingBar = await lazySelector(
    'footer[data-testid=now-playing-bar]'
  )
  spotifySetupAdsObserver(nowPlayingBar)
  LOG('Monitoring ads now!')
}

async function tidalInit () {
  LOG('Waiting for track details to be ready...')
  const trackDetails = await lazySelector(
    'div#footerPlayer > div[data-type=mediaItem] > :nth-child(2)'
  )
  tidalSetupAdsObserver(trackDetails)
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
// As mentioned above, using Deezer's own event for ad detection isn't that
// great for us. However, the other two events, fired when an ad finishes or
// an ad fails, are reliable and fast.
// To manually detect the ad, we observe children mutations in `document.body`.
// Deezer will append a hidden element with a specific id.
function deezerSetupAdsObserver () {
  const mo = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const addedNode of mutation.addedNodes) {
        if (addedNode.id && addedNode.id.startsWith('sas-background-')) {
          LOG('Ad detected in our song queue, muting tab...')
          sendToBg({ action: 'mute' })
          return
        }
      }
    }
  })
  mo.observe(document.body, {
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

// TIDAL's ad detection method:
// Observe children mutations in the track details <div>.
// If it's an ad, the first HTML element will be an anchor (<a>).
// See also: `tidalIsAd()`
function tidalSetupAdsObserver (trackDetails) {
  const mo = new MutationObserver(mutations => tidalHandleAd(mutations[0].target))
  mo.observe(trackDetails, {
    childList: true
  })
  // TIDAL ads persist through page reloads.
  // Our MutationObserver function is not triggered after the page loads.
  // Do a single manual check.
  tidalHandleAd(trackDetails, true)
  return mo
}

function tidalHandleAd (trackDetails, ignoreNonAd) {
  if (tidalIsAd(trackDetails)) {
    LOG('Ad detected in our song queue, muting tab...')
    sendToBg({ action: 'mute' })
    return
  }
  if (!ignoreNonAd) {
    LOG('Not an ad in our song queue, unmuting tab...')
    sendToBg({ action: 'unmute' })
  }
}

function tidalIsAd (trackDetails) {
  if (!trackDetails.firstElementChild) {
    return false
  }
  return trackDetails.firstElementChild.tagName === 'A'
}
