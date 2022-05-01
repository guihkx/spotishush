const defaultConfig = require('./web-ext-config.js')

module.exports = Object.assign(defaultConfig, {
  ignoreFiles: [],
  run: {
    chromiumProfile: './etc/chromium',
    args: [
      // https://peter.sh/experiments/chromium-command-line-switches/
      '--auto-open-devtools-for-tabs',
      '--disable-breakpad',
      '--disable-cloud-import',
      '--disable-default-apps',
      '--disable-ntp-most-likely-favicons-from-server',
      '--disable-ntp-popular-sites',
      '--disable-offline-auto-reload',
      '--disable-signin-promo',
      '--disable-single-click-autofill',
      '--disable-sync',
      '--enable-features=WebUIDarkMode',
      '--force-dark-mode',
      '--host-rules="MAP *.google-analytics.com 0.0.0.0","MAP *.googleadservices.com 0.0.0.0","MAP *.doubleclick.net 0.0.0.0 │ ","MAP *.googletagservices.com 0.0.0.0"',
      '--no-default-browser-check',
      '--no-pings',
      '--password-store=basic',
      '--restore-last-session',
      '--safebrowsing-disable-extension-blacklist',
      '--start-maximized'
    ],
    startUrl: [
      'https://accounts.spotify.com/en/login?continue=https://open.spotify.com/',
      'https://www.deezer.com/us/login/email?redirect_type=page&redirect_link=/us/playlist/1996494362',
      'https://listen.tidal.com/my-collection/mixes'
    ]
  }
})
