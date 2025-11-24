/**
 * Test Helper Utilities
 *
 * Common helper functions for E2E tests.
 */

import { WebDriver } from 'selenium-webdriver';
import { LoginPage } from '../pages/LoginPage.ts';
import type { TestAccount } from '../fixtures/test-accounts.ts';  
import { sleep } from './wait.ts';

/**
 * Login as a specific user
 */
export async function loginAsUser(
  driver: WebDriver,
  credentials: TestAccount
): Promise<void> {
  const loginPage = new LoginPage(driver);

  await loginPage.navigate();
  await loginPage.login(credentials.email, credentials.password);

  // Wait for login to complete (redirect to home or dashboard)
  await sleep(2000);
}

/**
 * Login as employer
 */
export async function loginAsEmployer(driver: WebDriver): Promise<void> {
  const { employerAccount } = await import('../fixtures/test-accounts.js');
  await loginAsUser(driver, employerAccount);
}

/**
 * Login as employee
 */
export async function loginAsEmployee(driver: WebDriver): Promise<void> {
  const { employeeAccount } = await import('../fixtures/test-accounts.js');
  await loginAsUser(driver, employeeAccount);
}

/**
 * Clear browser storage (localStorage, sessionStorage, cookies)
 */
export async function clearBrowserStorage(driver: WebDriver): Promise<void> {
  await driver.executeScript('window.localStorage.clear();');
  await driver.executeScript('window.sessionStorage.clear();');
  await driver.manage().deleteAllCookies();
}

/**
 * Wait for API response (by checking network activity via browser logs)
 * Note: This is a simplified version. For production, consider using browser DevTools Protocol.
 */
export async function waitForApiCall(
  driver: WebDriver,
  endpoint: string,
  timeout: number = 10000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      // Check if the endpoint was called by inspecting browser logs
      const logs = await driver.manage().logs().get('browser');
      const found = logs.some((log) => log.message.includes(endpoint));

      if (found) {
        return;
      }

      await sleep(500);
    } catch (error) {
      // Logs might not be available, continue
      await sleep(500);
    }
  }

  throw new Error(`API endpoint ${endpoint} was not called within ${timeout}ms`);
}

/**
 * Get authentication token from localStorage
 */
export async function getAuthToken(driver: WebDriver): Promise<string | null> {
  try {
    const token = await driver.executeScript<string>(
      'return window.localStorage.getItem("auth-token") || window.localStorage.getItem("token");'
    );
    return token;
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(driver: WebDriver): Promise<boolean> {
  const token = await getAuthToken(driver);
  return token !== null && token.length > 0;
}

/**
 * Log current page information (for debugging)
 */
export async function logPageInfo(driver: WebDriver): Promise<void> {
  const url = await driver.getCurrentUrl();
  const title = await driver.getTitle();

  console.log('='.repeat(50));
  console.log(`Current URL: ${url}`);
  console.log(`Page Title: ${title}`);
  console.log('='.repeat(50));
}

/**
 * Wait for element to be removed from DOM
 */
export async function waitForElementRemoved(
  driver: WebDriver,
  selector: string,
  timeout: number = 5000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const elements = await driver.findElements({ css: selector });
      if (elements.length === 0) {
        return;
      }
      await sleep(100);
    } catch (error) {
      return;
    }
  }

  throw new Error(`Element ${selector} was not removed within ${timeout}ms`);
}

/**
 * Retry an action multiple times with delay
 */
export async function retryAction<T>(
  action: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      console.log(`Retry ${i + 1}/${maxRetries} failed:`, error);

      if (i < maxRetries - 1) {
        await sleep(delayMs);
      }
    }
  }

  throw lastError || new Error('Action failed after retries');
}

/**
 * Generate unique test identifier
 */
export function generateTestId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
