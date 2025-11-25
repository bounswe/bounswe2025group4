/**
 * Wait Utilities
 *
 * Custom wait conditions and helper functions for Selenium WebDriver.
 */

import { WebDriver, By, until, WebElement } from 'selenium-webdriver';

/**
 * Default timeout for waits (10 seconds)
 */
const DEFAULT_TIMEOUT = 10000;

/**
 * Wait for element to be located
 */
export async function waitForElement(
  driver: WebDriver,
  locator: By,
  timeout: number = DEFAULT_TIMEOUT
): Promise<WebElement> {
  return await driver.wait(until.elementLocated(locator), timeout);
}

/**
 * Wait for element to be visible
 */
export async function waitForElementVisible(
  driver: WebDriver,
  locator: By,
  timeout: number = DEFAULT_TIMEOUT
): Promise<WebElement> {
  const element = await waitForElement(driver, locator, timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  return element;
}

/**
 * Wait for element to be clickable (visible and enabled)
 */
export async function waitForElementClickable(
  driver: WebDriver,
  locator: By,
  timeout: number = DEFAULT_TIMEOUT
): Promise<WebElement> {
  const element = await waitForElementVisible(driver, locator, timeout);
  await driver.wait(until.elementIsEnabled(element), timeout);
  return element;
}

/**
 * Wait for element to disappear
 */
export async function waitForElementToDisappear(
  driver: WebDriver,
  locator: By,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  await driver.wait(async () => {
    try {
      const elements = await driver.findElements(locator);
      return elements.length === 0;
    } catch (error) {
      return true;
    }
  }, timeout);
}

/**
 * Wait for element to contain specific text
 */
export async function waitForElementText(
  driver: WebDriver,
  locator: By,
  text: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<WebElement> {
  const element = await waitForElement(driver, locator, timeout);
  await driver.wait(until.elementTextContains(element, text), timeout);
  return element;
}

/**
 * Wait for URL to contain specific text
 */
export async function waitForUrlContains(
  driver: WebDriver,
  urlPart: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  await driver.wait(until.urlContains(urlPart), timeout);
}

/**
 * Wait for URL to match exactly
 */
export async function waitForUrlIs(
  driver: WebDriver,
  url: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  await driver.wait(until.urlIs(url), timeout);
}

/**
 * Wait for title to contain specific text
 */
export async function waitForTitleContains(
  driver: WebDriver,
  title: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  await driver.wait(until.titleContains(title), timeout);
}

/**
 * Wait for element count to be a specific number
 */
export async function waitForElementCount(
  driver: WebDriver,
  locator: By,
  count: number,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  await driver.wait(async () => {
    const elements = await driver.findElements(locator);
    return elements.length === count;
  }, timeout);
}

/**
 * Wait for element count to be at least a minimum number
 */
export async function waitForMinimumElementCount(
  driver: WebDriver,
  locator: By,
  minCount: number,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  await driver.wait(async () => {
    const elements = await driver.findElements(locator);
    return elements.length >= minCount;
  }, timeout);
}

/**
 * Wait for a custom condition
 */
export async function waitForCondition(
  driver: WebDriver,
  condition: () => Promise<boolean>,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  await driver.wait(condition, timeout);
}

/**
 * Wait for element attribute to have specific value
 */
export async function waitForElementAttribute(
  driver: WebDriver,
  locator: By,
  attribute: string,
  value: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  await driver.wait(async () => {
    const element = await driver.findElement(locator);
    const attrValue = await element.getAttribute(attribute);
    return attrValue === value;
  }, timeout);
}

/**
 * Simple sleep function (use sparingly, prefer specific waits)
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for element to be stale (removed from DOM or page changed)
 */
export async function waitForElementStale(
  driver: WebDriver,
  element: WebElement,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  await driver.wait(until.stalenessOf(element), timeout);
}

/**
 * Wait for alert to be present
 */
export async function waitForAlert(
  driver: WebDriver,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  await driver.wait(until.alertIsPresent(), timeout);
}
