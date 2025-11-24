/**
 * E2E Test Configuration
 *
 * Loads environment variables from .env.e2e and provides type-safe configuration
 * for Selenium WebDriver tests.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load .env.e2e file from tests/e2e/selenium directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.e2e');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`⚠️  Warning: Could not load .env.e2e from ${envPath}`);
  console.warn('Using default configuration values.');
}

export interface TestConfig {
  baseUrl: string;
  apiUrl: string;
  headless: boolean;
  browserWidth: number;
  browserHeight: number;
  implicitWait: number;
  pageLoadTimeout: number;
  scriptTimeout: number;
  employer: {
    username: string;
    password: string;
  };
  employee: {
    username: string;
    password: string;
  };
  targetWorkplaceId: string;
  screenshots: {
    onFailure: boolean;
    directory: string;
  };
}

/**
 * Get test configuration from environment variables
 */
export function getTestConfig(): TestConfig {
  return {
    baseUrl: process.env.E2E_BASE_URL || 'http://localhost:4173',
    apiUrl: process.env.E2E_API_URL || 'http://localhost:8080/api',
    headless: process.env.E2E_HEADLESS === 'true',
    browserWidth: parseInt(process.env.E2E_BROWSER_WIDTH || '1920', 10),
    browserHeight: parseInt(process.env.E2E_BROWSER_HEIGHT || '1080', 10),
    implicitWait: parseInt(process.env.E2E_IMPLICIT_WAIT || '10000', 10),
    pageLoadTimeout: parseInt(process.env.E2E_PAGE_LOAD_TIMEOUT || '30000', 10),
    scriptTimeout: parseInt(process.env.E2E_SCRIPT_TIMEOUT || '30000', 10),
    employer: {
      username: process.env.E2E_EMPLOYER_USERNAME || 'e2e-employer@test.com',
      password: process.env.E2E_EMPLOYER_PASSWORD || 'TestPass123!',
    },
    employee: {
      username: process.env.E2E_EMPLOYEE_USERNAME || 'e2e-employee@test.com',
      password: process.env.E2E_EMPLOYEE_PASSWORD || 'TestPass123!',
    },
    targetWorkplaceId: process.env.E2E_TARGET_WORKPLACE_ID || '1',
    screenshots: {
      onFailure: process.env.E2E_SCREENSHOT_ON_FAILURE === 'true',
      directory: process.env.E2E_SCREENSHOTS_DIR || 'tests/e2e/selenium/screenshots',
    },
  };
}

export const config = getTestConfig();
