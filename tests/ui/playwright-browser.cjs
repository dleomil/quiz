const { chromium: playwrightChromium } = require('playwright');

function launchOptions(options = {}, channel) {
  return channel ? { ...options, channel } : { ...options };
}

const chromium = {
  launch(options) {
    return playwrightChromium.launch(
      launchOptions(options, process.env.PLAYWRIGHT_BROWSER_CHANNEL),
    );
  },
};

module.exports = { chromium, launchOptions };
