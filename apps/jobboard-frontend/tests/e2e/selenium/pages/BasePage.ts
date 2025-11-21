/**
 * Base Page Object
 *
 * Base class for all page objects with common functionality.
 */

import { WebDriver, By, WebElement } from 'selenium-webdriver';
import { config } from '../config/test.config.js';
import {
  waitForElement,
  waitForElementVisible,
  waitForElementClickable,
  waitForUrlContains,
} from '../utils/wait.js';
import { takeScreenshot } from '../utils/screenshot.js';
import { scrollToElement } from '../utils/driver.js';

export class BasePage {
  protected driver: WebDriver;
  protected baseUrl: string;

  constructor(driver: WebDriver) {
    this.driver = driver;
    this.baseUrl = config.baseUrl;
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string): Promise<void> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    await this.driver.get(url);
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return await this.driver.getCurrentUrl();
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.driver.getTitle();
  }

  /**
   * Find element
   */
  async findElement(locator: By): Promise<WebElement> {
    return await this.driver.findElement(locator);
  }

  /**
   * Find elements
   */
  async findElements(locator: By): Promise<WebElement[]> {
    return await this.driver.findElements(locator);
  }

  /**
   * Wait for element and return it
   */
  async waitForElement(locator: By, timeout?: number): Promise<WebElement> {
    return await waitForElement(this.driver, locator, timeout);
  }

  /**
   * Wait for element to be visible
   */
  async waitForVisible(locator: By, timeout?: number): Promise<WebElement> {
    return await waitForElementVisible(this.driver, locator, timeout);
  }

  /**
   * Wait for element to be clickable
   */
  async waitForClickable(locator: By, timeout?: number): Promise<WebElement> {
    return await waitForElementClickable(this.driver, locator, timeout);
  }

  /**
   * Click on element
   */
  async click(locator: By, timeout?: number): Promise<void> {
    const element = await this.waitForClickable(locator, timeout);
    await element.click();
  }

  /**
   * Type text into input field
   */
  async type(locator: By, text: string, timeout?: number): Promise<void> {
    const element = await this.waitForVisible(locator, timeout);
    await element.clear();
    await element.sendKeys(text);
  }

  /**
   * Get text from element
   */
  async getText(locator: By, timeout?: number): Promise<string> {
    const element = await this.waitForVisible(locator, timeout);
    return await element.getText();
  }

  /**
   * Get attribute from element
   */
  async getAttribute(
    locator: By,
    attribute: string,
    timeout?: number
  ): Promise<string | null> {
    const element = await this.waitForElement(locator, timeout);
    return await element.getAttribute(attribute);
  }

  /**
   * Check if element is displayed
   */
  async isDisplayed(locator: By): Promise<boolean> {
    try {
      const element = await this.driver.findElement(locator);
      return await element.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if element exists in DOM
   */
  async elementExists(locator: By): Promise<boolean> {
    try {
      const elements = await this.driver.findElements(locator);
      return elements.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get count of elements matching locator
   */
  async getElementCount(locator: By): Promise<number> {
    const elements = await this.driver.findElements(locator);
    return elements.length;
  }

  /**
   * Wait for URL to contain specific text
   */
  async waitForUrlContains(text: string, timeout?: number): Promise<void> {
    await waitForUrlContains(this.driver, text, timeout);
  }

  /**
   * Scroll to element
   */
  async scrollTo(locator: By): Promise<void> {
    const element = await this.findElement(locator);
    await scrollToElement(this.driver, element);
  }

  /**
   * Execute JavaScript
   */
  async executeScript<T>(script: string, ...args: any[]): Promise<T> {
    return (await this.driver.executeScript(script, ...args)) as T;
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<string | null> {
    return await takeScreenshot(this.driver, name);
  }

  /**
   * Wait for page to load (waits for document.readyState === 'complete')
   */
  async waitForPageLoad(timeout: number = 10000): Promise<void> {
    await this.driver.wait(async () => {
      const readyState = await this.driver.executeScript<string>(
        'return document.readyState'
      );
      return readyState === 'complete';
    }, timeout);
  }

  /**
   * Refresh the page
   */
  async refresh(): Promise<void> {
    await this.driver.navigate().refresh();
  }

  /**
   * Navigate back
   */
  async goBack(): Promise<void> {
    await this.driver.navigate().back();
  }

  /**
   * Navigate forward
   */
  async goForward(): Promise<void> {
    await this.driver.navigate().forward();
  }

  /**
   * Select option from dropdown by visible text
   */
  async selectByVisibleText(locator: By, text: string): Promise<void> {
    const element = await this.waitForVisible(locator);
    await element.sendKeys(text);
  }

  /**
   * Clear input field
   */
  async clear(locator: By): Promise<void> {
    const element = await this.waitForVisible(locator);
    await element.clear();
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(locator: By): Promise<boolean> {
    try {
      const element = await this.findElement(locator);
      return await element.isEnabled();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get CSS value from element
   */
  async getCssValue(locator: By, property: string): Promise<string> {
    const element = await this.findElement(locator);
    return await element.getCssValue(property);
  }
}
