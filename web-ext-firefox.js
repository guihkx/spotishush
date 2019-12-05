const defaultConfig = require('./web-ext-config.js')

module.exports = Object.assign(defaultConfig, {
  ignoreFiles: [],
  run: {
    args: ['-devtools'],
    pref: [
      'app.shield.optoutstudies.enabled=false',
      'browser.ctrlTab.recentlyUsedOrder=false',
      'browser.discovery.enabled=false',
      'browser.messaging-system.whatsNewPanel.enabled=false',
      'browser.newtabpage.enabled=false',
      'browser.safebrowsing.malware.enabled=false',
      'browser.safebrowsing.phishing.enabled=false',
      'browser.search.suggest.enabled=false',
      'browser.urlbar.suggest.searches=false',
      'datareporting.healthreport.uploadEnabled=false',
      'datareporting.policy.dataSubmissionEnabled=false',
      'devtools.theme=dark',
      'devtools.toolbox.host=right',
      'devtools.toolbox.selectedTool=webconsole',
      'devtools.toolbox.sidebar.width=600',
      'devtools.webconsole.timestampMessages=true',
      'media.eme.enabled=true',
      'network.cookie.cookieBehavior=1',
      'network.dns.disablePrefetch=true',
      'privacy.trackingprotection.cryptomining.enabled=false',
      'privacy.trackingprotection.pbmode.enabled=false',
      'signon.management.page.breach-alerts.enabled=false',
      'toolkit.telemetry.enabled=false',
      'toolkit.telemetry.unified=false'
    ],
    startUrl: [
      'https://accounts.spotify.com/en/login?continue=https://open.spotify.com/',
      'about:debugging#/runtime/this-firefox'
    ]
  }
})
