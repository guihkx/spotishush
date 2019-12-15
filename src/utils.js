'use strict'

// https://github.com/standard/standard/issues/614
window.SpotiShush = class SpotiShush {
  static say (level) {
    const extManifest = browser.runtime.getManifest()

    console[level](
      `%c[${extManifest.name} v${extManifest.version}]`,
      'font-weight: bold; background: #000; color: #1db954',
      ...Array.prototype.slice.call(arguments, 1)
    )
  }

  static log () {
    this.say('log', ...arguments)
  }

  static debug () {
    this.say('debug', ...arguments)
  }
}
