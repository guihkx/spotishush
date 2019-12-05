const defaultConfig = require('./web-ext-config.js')

module.exports = Object.assign(defaultConfig, {
  ignoreFiles: [],
  run: {
    chromiumProfile: './tmp-chromium',
    args: [
      '--auto-open-devtools-for-tabs',
      '--start-maximized',
      '--disable-breakpad',
      '--disable-default-apps',
      '--disable-signin-promo',
      '--disable-sync',
      '--no-default-browser-check',
      '--no-pings',
      '--restore-last-session'
    ],
    startUrl: [
      'https://accounts.spotify.com/en/login?continue=https://open.spotify.com/',
    ]
  }
})