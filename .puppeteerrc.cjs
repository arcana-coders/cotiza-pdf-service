const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Cache Chromium in node_modules to speed up installs on Render
  cacheDirectory: join(__dirname, 'node_modules', '.puppeteer-cache'),
};
