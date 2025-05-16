# <img valign="middle" src="./etc/spotishush-logo.svg" width="32" height="32"> SpotiShush

SpotiShush is a browser extension that automatically mutes audio ads on many music streaming services, including:

- [Spotify Web Player](https://open.spotify.com/)
- [Deezer](https://www.deezer.com/)
- [IDAGIO](https://app.idagio.com/)
- [Zvuk *(Звук)*](https://zvuk.com/)

## Installation

Pick the right one for your browser:

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/dfbbfmkkafpoohlcmkndjnpohhgelgnf?label=GOOGLE+CHROME&style=for-the-badge)](https://chrome.google.com/webstore/detail/dfbbfmkkafpoohlcmkndjnpohhgelgnf)

[![Mozilla Add-on](https://img.shields.io/amo/v/spotishush?label=MOZILLA+FIREFOX&style=for-the-badge)](https://addons.mozilla.org/firefox/addon/spotishush/)

[![Edge Add-on](https://img.shields.io/badge/dynamic/json?prefix=V&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fcfohjlnnhademjaockpjlilclkiimchg&label=MICROSOFT+EDGE&style=for-the-badge)](https://microsoftedge.microsoft.com/addons/detail/cfohjlnnhademjaockpjlilclkiimchg)

No additional configuration is required! You just have to reload any existing tab that is playing music.

---

## FAQ

### Why not use an Ad Blocker instead?

While ads can sometimes be annoying (especially in audio format), I believe most music streaming websites offer an awesome service for non-paying users. And I also believe that if most people used an ad-blocker, the free modality would probably be much more limited.

### How does it work?

SpotiShush will instantly mute the browser tab once it detects an audio ad will play. After the ad finishes, SpotiShush will restore the tab's audio so you can enjoy your favorite songs again.

---

## Contributing

### Testing

**NOTE: This has been tested on Linux only!**

We'll use `web-ext` to help with the testing/debugging process a bit. It will create a temporary profile on Firefox or Chrome for us, with SpotiShush pre-installed in it. So, to begin doing your testing, run:

Firefox:

```bash
yarn start:firefox
```

Chrome/Chromium:

```bash
yarn start:chromium
```

Don't worry about having to re-run the command above every time you change something in the code, because `web-ext` supports hot-reloading. You may want to reload the tabs in your browser, however.

### Linting

SpotiShush follows the [StandardJS coding style](https://standardjs.com/).

Before you commit your changes, please run the `standard` linter to check for errors:

```bash
yarn standard:check
```

Then, proceed to run Standard's automatic code formatter:

```bash
yarn standard:fix
```

After that, feel free to send a pull request. :)
