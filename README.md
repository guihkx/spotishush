# <img valign="middle" src="./etc/spotishush-logo.svg" width="32" height="32"> SpotiShush

SpotiShush is a browser extension that automatically mutes audio ads on [Spotify Web Player](https://open.spotify.com/).

## Installation

Pick the right extension for your browser, and install it:

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/dfbbfmkkafpoohlcmkndjnpohhgelgnf?label=GOOGLE+CHROME&style=for-the-badge)](https://chrome.google.com/webstore/detail/dfbbfmkkafpoohlcmkndjnpohhgelgnf)

[![Mozilla Add-on](https://img.shields.io/amo/v/spotishush?label=MOZILLA+FIREFOX&style=for-the-badge)](https://addons.mozilla.org/firefox/addon/spotishush/)

After the installation, just reload the Spotify tab in your browser and you're good to go!

You can go to [Releases](https://github.com/guihkx/spotishush/releases) if you need `.crx` or `.xpi` files.

---

## FAQ

### Why not use an Ad Blocker instead?

While ads can sometimes be annoying (especially in audio), I believe Spotify offers a great service for free and I like to show them support by disabling the ad blocker on their website.

### How does it work?

SpotiShush will automatically mute the Spotify tab before it plays any audio ad. After the ad finishes, SpotiShush unmutes the tab so you can enjoy your favorite songs again.

---

## Contributing

### Testing

**NOTE: This has been tested on Linux only!**

After you modify the code, you'll probably have to test it on Spotify. To automate this process a bit, we'll use `web-ext` to create a temporary Firefox/Chrome profile, with SpotiShush installed in it:

```bash
# Test it on Firefox
yarn start:firefox
# Test it on Chromium/Chrome
yarn start:chromium
```

The command above will open Spotify's login page, so you'll obviously need a Spotify account to do your testing.

It's also worth mentioning that you don't have re-open the browser every time you modify the code, because the extension will auto-reload once you save any file (this works best on Firefox, in my experience).

### Linting

SpotiShush follows the [StandardJS coding style](https://standardjs.com/). Fortunately, it has an automatic code linter that helps you with the styling.

Before you commit your changes, run the `standard` linter to check for any errors:

```bash
yarn standard:check
```

Fix any errors, then proceed to run `standard`'s automatic code formatter:

```bash
yarn standard:fix
```

And that's pretty much it. Now you can commit your changes and send a pull request!
