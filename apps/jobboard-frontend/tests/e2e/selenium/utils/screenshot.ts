/**
 * Screenshot Utilities
 *
 * Functions for capturing screenshots during E2E tests.
 */

import { WebDriver } from 'selenium-webdriver';
import * as fs from 'fs';
import * as path from 'path';
import { config } from '../config/test.config.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Ensure screenshots directory exists
 */
function ensureScreenshotsDir(): string {
  const screenshotsDir = path.resolve(__dirname, '../../../../', config.screenshots.directory);

  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  return screenshotsDir;
}

/**
 * Generate screenshot filename with timestamp
 */
function generateFilename(testName: string): string {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
  const sanitizedTestName = testName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${sanitizedTestName}_${timestamp}.png`;
}

/**
 * Take a screenshot
 */
export async function takeScreenshot(
  driver: WebDriver,
  testName: string
): Promise<string | null> {
  try {
    const screenshotsDir = ensureScreenshotsDir();
    const filename = generateFilename(testName);
    const filepath = path.join(screenshotsDir, filename);

    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(filepath, screenshot, 'base64');

    console.log(`Screenshot saved: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error('Failed to take screenshot:', error);
    return null;
  }
}

/**
 * Take screenshot on test failure
 */
export async function takeScreenshotOnFailure(
  driver: WebDriver,
  testName: string,
  error: Error
): Promise<string | null> {
  if (!config.screenshots.onFailure) {
    return null;
  }

  console.error(`Test failed: ${testName}`);
  console.error('Error:', error.message);

  return await takeScreenshot(driver, `failure_${testName}`);
}

/**
 * Clean old screenshots (optional utility)
 */
export function cleanOldScreenshots(daysOld: number = 7): void {
  try {
    const screenshotsDir = path.resolve(__dirname, '../../../../', config.screenshots.directory);

    if (!fs.existsSync(screenshotsDir)) {
      return;
    }

    const files = fs.readdirSync(screenshotsDir);
    const now = Date.now();
    const maxAge = daysOld * 24 * 60 * 60 * 1000;

    files.forEach((file) => {
      const filepath = path.join(screenshotsDir, file);
      const stats = fs.statSync(filepath);
      const age = now - stats.mtime.getTime();

      if (age > maxAge) {
        fs.unlinkSync(filepath);
        console.log(`Deleted old screenshot: ${file}`);
      }
    });
  } catch (error) {
    console.error('Failed to clean old screenshots:', error);
  }
}
