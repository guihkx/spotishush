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
        const nowPlaying = document.querySelector('div.now-playing')

        if (nowPlaying !== null) {
          clearInterval(id)
          resolve(nowPlaying)
        }
      }, checkInterval || 500)
    })
  }

  // Detect ads by observing mutations in Spotify's player controls.
  //
  // Previously, to detect an ad we'd check if the `firstElementChild` of
  // the `nowPlaying` element was _not_ a <span> tag and also _not_ draggable.
  // Now, the detection has been simplified a bit by just checking if the
  // `firstElementChild` is an anchor element (<a>).
  function setupAdsObserver (nowPlaying) {
    const mo = new MutationObserver(async (mutations) => {
      const artworkObj = nowPlaying.firstElementChild

      if (artworkObj === null) {
        throw new Error('BUG: Unable to get child node!')
      }
      SpotiShush.debug('artworkObj:', artworkObj)
      SpotiShush.debug('mutations:', mutations)

      if (artworkObj.tagName === 'A') {
        // This is an ad. Here's the simplified HTML snippet:
        //
        // <a href="https://some-ad-website.com/">
        //     <div class="now-playing__cover-art">...</div>
        // </a>
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
        //     <a aria-label="Now playing: ..." href="..."></a>
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
    mo.observe(nowPlaying, {
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
