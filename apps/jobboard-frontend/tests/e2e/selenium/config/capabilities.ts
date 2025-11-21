/**
 * Browser Capabilities Configuration
 *
 * Defines Chrome browser capabilities for Selenium WebDriver.
 */

import { Capabilities } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { config } from './test.config.ts';

/**
 * Get Chrome browser capabilities
 */
export function getChromeCapabilities(): Capabilities {
  const options = new chrome.Options();

  // Try to set Chrome binary path explicitly (common locations on Windows)
  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.CHROME_BIN, // Allow override via environment variable
  ].filter(Boolean);

  // Set the first valid path if found
  for (const path of chromePaths) {
    if (path) {
      try {
        options.setChromeBinaryPath(path);
        break;
      } catch (e) {
        // Continue to next path if this one doesn't work
      }
    }
  }

  // Headless mode
  if (config.headless) {
    options.addArguments('--headless=new');
    options.addArguments('--disable-software-rasterizer');
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

  // Additional arguments for Windows compatibility
  options.addArguments('--disable-blink-features=AutomationControlled');
  options.addArguments('--disable-features=VizDisplayCompositor');

  // Enable logging for debugging
  options.setLoggingPrefs({
    browser: 'ALL',
    driver: 'ALL',
  });

  // Accept insecure certificates (for local testing)
  options.addArguments('--ignore-certificate-errors');

  return options;
}
