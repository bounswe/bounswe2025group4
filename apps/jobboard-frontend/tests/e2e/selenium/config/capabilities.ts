/**
 * Browser Capabilities Configuration
 *
 * Defines Chrome browser capabilities for Selenium WebDriver.
 */

import { Capabilities } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { config } from './test.config.js';

/**
 * Get Chrome browser capabilities
 */
export function getChromeCapabilities(): Capabilities {
  const options = new chrome.Options();

  // Headless mode
  if (config.headless) {
    options.addArguments('--headless=new');
  }

  // Window size
  options.addArguments(`--window-size=${config.browserWidth},${config.browserHeight}`);

  // Additional options for stability
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--disable-extensions');
  options.addArguments('--disable-notifications');
  options.addArguments('--disable-popup-blocking');

  // Enable logging for debugging
  options.setLoggingPrefs({
    browser: 'ALL',
    driver: 'ALL',
  });

  // Accept insecure certificates (for local testing)
  options.addArguments('--ignore-certificate-errors');

  return options;
}
