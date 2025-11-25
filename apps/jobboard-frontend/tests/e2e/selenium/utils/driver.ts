/**
 * WebDriver Utility
 *
 * Provides functions for initializing and managing Selenium WebDriver instances.
 */

import { Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { config } from '../config/test.config.ts';
import { getChromeCapabilities } from '../config/capabilities.ts';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Initialize a new WebDriver instance with Chrome
 */
export async function initDriver(): Promise<WebDriver> {
  const chromeOptions = getChromeCapabilities() as chrome.Options;
  chromeOptions.addArguments("--disable-notifications");
  chromeOptions.addArguments("--disable-features=PushMessaging");
  chromeOptions.addArguments("--disable-logging");
  chromeOptions.addArguments("--log-level=3");

  // Get the project root directory (where node_modules is)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '../../../..');
  const chromeDriverPath = path.join(projectRoot, 'node_modules', 'chromedriver', 'lib', 'chromedriver', 'chromedriver.exe');

  // Set up the ChromeDriver service
  const service = new chrome.ServiceBuilder(chromeDriverPath);

  // Add a timeout wrapper to detect hanging driver initialization
  const driverPromise = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .setChromeService(service)
    .build();

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(
        'WebDriver initialization timed out after 30 seconds.\n' +
        'Possible causes:\n' +
        '  - ChromeDriver is not installed or not in PATH\n' +
        '  - Chrome browser is not installed\n' +
        '  - ChromeDriver version does not match Chrome version\n' +
        '  - A previous Chrome instance is blocking the port\n\n' +
        'Try:\n' +
        '  1. Run: pnpm install (to ensure chromedriver is installed)\n' +
        '  2. Check Chrome is installed and up to date\n' +
        '  3. Kill any hanging Chrome/ChromeDriver processes'
      ));
    }, 30000);
  });

  let driver: WebDriver;
  try {
    driver = await Promise.race([driverPromise, timeoutPromise]);
  } catch (error) {
    console.error('\n❌ Failed to initialize WebDriver');
    throw error;
  }

  try {
    // Set timeouts
    await driver.manage().setTimeouts({
      implicit: config.implicitWait,
      pageLoad: config.pageLoadTimeout,
      script: config.scriptTimeout,
    });

    // Maximize window (or set specific size)
    await driver
      .manage()
      .window()
      .setRect({ width: config.browserWidth, height: config.browserHeight });

    return driver;
  } catch (error) {
    // Clean up driver if configuration fails
    await quitDriver(driver);
    throw error;
  }
}

/**
 * Quit the WebDriver instance and clean up
 */
export async function quitDriver(driver: WebDriver | null): Promise<void> {
  if (driver) {
    try {
      await driver.quit();
    } catch (error) {
      console.error('Error quitting driver:', error);
    }
  }
}

/**
 * Navigate to a URL
 */
export async function navigateTo(driver: WebDriver, path: string): Promise<void> {
  const url = path.startsWith('http') ? path : `${config.baseUrl}${path}`;
  await driver.get(url);
}

/**
 * Get current URL
 */
export async function getCurrentUrl(driver: WebDriver): Promise<string> {
  return await driver.getCurrentUrl();
}

/**
 * Get page title
 */
export async function getTitle(driver: WebDriver): Promise<string> {
  return await driver.getTitle();
}

/**
 * Refresh the page
 */
export async function refresh(driver: WebDriver): Promise<void> {
  await driver.navigate().refresh();
}

/**
 * Execute JavaScript in the browser
 */
export async function executeScript<T>(
  driver: WebDriver,
  script: string,
  ...args: any[]
): Promise<T> {
  return (await driver.executeScript(script, ...args)) as T;
}

/**
 * Scroll to element
 */
export async function scrollToElement(
  driver: WebDriver,
  element: any
): Promise<void> {
  await driver.executeScript('arguments[0].scrollIntoView(true);', element);
}

/**
 * Scroll to top of page
 */
export async function scrollToTop(driver: WebDriver): Promise<void> {
  await driver.executeScript('window.scrollTo(0, 0);');
}

/**
 * Scroll to bottom of page
 */
export async function scrollToBottom(driver: WebDriver): Promise<void> {
  await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
}
