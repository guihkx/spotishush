module.exports = {
  artifactsDir: './web-ext-artifacts',
  build: {
    overwriteDest: true
  },
  ignoreFiles: ['**/*.js.map'],
  run: {
    startUrl: [
      'https://accounts.spotify.com/en/login?continue=https://open.spotify.com/',
      'https://www.deezer.com/us/login/email?redirect_type=page&redirect_link=/us/playlist/1996494362',
      'https://listen.tidal.com/login?autoredirect=true&lang=en'
    ]
  },
  sourceDir: './src',
  verbose: false
}
