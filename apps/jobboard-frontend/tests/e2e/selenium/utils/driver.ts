/**
 * WebDriver Utility
 *
 * Provides functions for initializing and managing Selenium WebDriver instances.
 */

import { Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { config } from '../config/test.config.js';
import { getChromeCapabilities } from '../config/capabilities.js';

/**
 * Initialize a new WebDriver instance with Chrome
 */
export async function initDriver(): Promise<WebDriver> {
  const chromeOptions = getChromeCapabilities() as chrome.Options;

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

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
