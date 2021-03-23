;(async () => {
  'use strict'

  SpotiShush.log('Started!')

  // Current tab might be muted if the user refreshed the page while
  // an ad was playing. So, only if *we* had muted it, we unmute it.
  try {
    await browser.runtime.sendMessage({ action: 'unmute' })
  } catch (error) {
    SpotiShush.debug(error.message)
  }
  // Deezer
  if (window.location.hostname === 'www.deezer.com') {
    window.addEventListener('sasVideoStart', deezerRunBeforeAds)
    window.addEventListener('sasVideoEnd', deezerRunAfterAds)
    window.addEventListener('adError', deezerRunAfterAds)

    // Well, that was easy...
    SpotiShush.log('Monitoring ads now!')

    return
  }
  // Spotify
  SpotiShush.log('Waiting for player controls to be ready...')

  const nowPlaying = await spotifyControlsReady()

  try {
    setupAdsObserver(nowPlaying)
  } catch (error) {
    SpotiShush.log('Unable to set up ads monitor:', error.message)
    return
  }
  SpotiShush.log('Success. Monitoring ads now!')

  function spotifyControlsReady (checkInterval) {
    return new Promise((resolve) => {
      const id = setInterval(() => {
        const nowPlaying = document.querySelector('div.Root__now-playing-bar')

        if (nowPlaying !== null) {
          clearInterval(id)
          resolve(nowPlaying)
        }
      }, checkInterval || 500)
    })
  }

  // Detect ads by observing mutations in the `data-testid` HTML attribute of Spotify's player controls.
  function setupAdsObserver (nowPlaying) {
    const footerObj = nowPlaying.firstElementChild

    if (footerObj === null) {
      throw new Error('BUG: Unable to get child node from `nowPlaying`!')
    }
    SpotiShush.debug('footerObj:', footerObj)

    if (footerObj.tagName !== 'FOOTER') {
      throw new Error('BUG: Expected a `footer` tag, but got:', footerObj.tagName)
    }

    const mo = new MutationObserver(async (mutations) => {
      SpotiShush.debug('mutations:', mutations)

      if (footerObj.getAttribute('data-testid') === 'now-playing-bar-ad-type-ad') {
        // This is an ad. Here's the simplified HTML snippet:
        //
        // <div class="...-scss ellipsis-one-line ...-scss" data-testid="track-info-name" as="div" dir="auto">
        //   <a href="https://some-ad-website.com/" data-testid="track-info-advertiser">Advertisement</a>
        // </div>
        SpotiShush.log('Ad detected!')
        try {
          await browser.runtime.sendMessage({ action: 'mute' })
        } catch (error) {
          SpotiShush.debug(error.message)
          return
        }
        SpotiShush.log('Tab muted.')
      } else {
        // This is a regular song. Here's the simplified HTML snippet:
        //
        // <div data-testid="CoverSlotCollapsed__container" class="...-scss" aria-hidden="true">
        //   <div draggable="true">
        //     <a data-testid="cover-art-link" aria-label="Now playing: ..." href="..."></a>
        //   </div>
        // </div>
        SpotiShush.log('Not an ad!')
        try {
          await browser.runtime.sendMessage({ action: 'unmute' })
        } catch (error) {
          SpotiShush.debug(error.message)
          return
        }
        SpotiShush.log('Tab unmuted.')
      }
    })
    mo.observe(footerObj, {
      attributes: true
    })
  }

  async function deezerRunBeforeAds () {
    SpotiShush.log('Ad detected!')
    try {
      await browser.runtime.sendMessage({ action: 'mute' })
    } catch (error) {
      SpotiShush.debug(error.message)
      return
    }
    SpotiShush.log('Tab muted.')
  }

  async function deezerRunAfterAds () {
    SpotiShush.log('Ad has ended!')
    try {
      await browser.runtime.sendMessage({ action: 'unmute' })
    } catch (error) {
      SpotiShush.debug(error.message)
      return
    }
    SpotiShush.log('Tab unmuted.')
  }
})()
