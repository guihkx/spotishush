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
  switch (window.location.hostname) {
    case 'www.deezer.com': {
      window.addEventListener('sasVideoStart', deezerRunBeforeAds)
      window.addEventListener('sasVideoEnd', deezerRunAfterAds)
      window.addEventListener('adError', deezerRunAfterAds)

      // Well, that was easy...
      SpotiShush.log('Monitoring ads now!')
      break
    }
    case 'open.spotify.com': {
      SpotiShush.log('Waiting for player controls to be ready...')

      // Spotify's "Now Playing" bar
      const nowPlaying = await lazySelector('div.Root__now-playing-bar')

      try {
        spotifySetupAdsObserver(nowPlaying)
      } catch (error) {
        SpotiShush.log('Unable to set up ads monitor:', error.message)
        return
      }
      SpotiShush.log('Success. Monitoring ads now!')
      break
    }
    case 'listen.tidal.com': {
      SpotiShush.log('Waiting for repeat button to be ready...')

      // TIDAL's repeat button
      const repeatButton = await lazySelector('div#playbackControlBar > button[data-test=repeat]')

      tidalSetupAdsObserver(repeatButton)

      SpotiShush.log('Success. Monitoring ads now!')
      // On TIDAL, ads are persistent through a page reload, so here we manually
      // trigger our ads observer function to determine if there's an ad in our queue.
      repeatButton.type = repeatButton.getAttribute('type')
      break
    }
    default:
      break
  }

  function lazySelector (selector, checkInterval) {
    return new Promise((resolve) => {
      const id = setInterval(() => {
        const element = document.querySelector(selector)

        if (element !== null) {
          clearInterval(id)
          resolve(element)
        }
      }, checkInterval || 500)
    })
  }

  function tidalSetupAdsObserver (repeatButton) {
    const mo = new MutationObserver(async (mutations) => {
      SpotiShush.debug('mutations:', mutations)

      if (repeatButton.disabled) {
        // TIDAL disables the repeat button when an ad is playing.
        SpotiShush.log('Ad detected!')
        try {
          await browser.runtime.sendMessage({ action: 'mute' })
        } catch (error) {
          SpotiShush.debug(error.message)
          return
        }
        SpotiShush.log('Tab muted.')
      } else {
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
    mo.observe(repeatButton, {
      attributes: true
    })
  }

  // Detect ads by observing mutations in the `data-testid` HTML attribute of Spotify's player controls.
  function spotifySetupAdsObserver (nowPlaying) {
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

      if (footerObj.getAttribute('data-testadtype') !== 'ad-type-none') {
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
