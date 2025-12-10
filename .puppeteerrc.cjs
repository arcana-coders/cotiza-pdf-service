const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Cache Chromium in a persistent directory on Render
  cacheDirectory: process.env.PUPPETEER_CACHE_DIR || join(__dirname, '.cache', 'puppeteer'),
};
