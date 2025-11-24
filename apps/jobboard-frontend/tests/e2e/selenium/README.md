# Selenium E2E Testing Framework

Comprehensive end-to-end testing framework for the Job Board application using Selenium WebDriver.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Page Object Model](#page-object-model)
- [Configuration](#configuration)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

This E2E testing framework uses:

- **Selenium WebDriver 4.x** - Browser automation
- **ChromeDriver** - Chrome browser driver
- **TypeScript** - Type-safe test code
- **Page Object Model** - Maintainable test structure
- **Modular Architecture** - Reusable utilities and fixtures

## Architecture

```
tests/e2e/selenium/
├── config/                    # Configuration files
│   ├── test.config.ts        # Test environment settings
│   └── capabilities.ts       # Browser capabilities
├── fixtures/                  # Test data
│   ├── test-accounts.ts      # User credentials
│   ├── workplace.fixtures.ts # Workplace test data
│   └── review.fixtures.ts    # Review test data
├── pages/                     # Page Object Model
│   ├── BasePage.ts           # Base page class
│   ├── LoginPage.ts          # Login page object
│   ├── EmployerDashboardPage.ts
│   ├── CreateWorkplacePage.ts
│   ├── WorkplaceDetailPage.ts
│   └── ReviewFormPage.ts
├── utils/                     # Utility functions
│   ├── driver.ts             # WebDriver initialization
│   ├── wait.ts               # Wait utilities
│   ├── screenshot.ts         # Screenshot capture
│   └── test-helpers.ts       # Common test helpers
├── specs/                     # Test specifications
│   └── workplace/
│       ├── 01-workplace-creation.test.ts
│       ├── 02-workplace-review-submission.test.ts
│       └── 03-workplace-creation-and-review.test.ts
├── screenshots/               # Test failure screenshots
├── run-tests.js              # Dynamic test runner
├── README.md                 # This file
└── HOW_TO_ADD_TESTS.md       # Guide for adding new tests
```

## Setup

### Prerequisites

1. **Node.js 18+** installed
2. **Chrome browser** installed
3. **pnpm** package manager

### Installation

Dependencies are already installed if you've run `pnpm install`. The E2E framework includes:

```json
{
  "selenium-webdriver": "^4.38.0",
  "@types/selenium-webdriver": "^4.35.4",
  "chromedriver": "^142.0.3",
  "dotenv": "^17.2.3"
}
```

**Note:** ChromeDriver binary installation is handled automatically via:
- `.npmrc` configuration file (allows chromedriver's install script)
- `postinstall` script (ensures chromedriver binary is downloaded after package installation)

If you encounter ChromeDriver issues, see the [Troubleshooting](#troubleshooting) section below.

### Environment Configuration

1. Copy the example environment file:

```bash
cp .env.e2e.example .env.e2e
```

2. Update `.env.e2e` with your settings:

```env
# Frontend URL (production build)
E2E_BASE_URL=http://localhost:4173

# Backend API URL (deployed dev backend or local)
E2E_API_URL=http://your-dev-backend-url.com/api

# Browser settings
E2E_HEADLESS=true
E2E_BROWSER_WIDTH=1920
E2E_BROWSER_HEIGHT=1080

# Test account credentials (must exist in your database)
E2E_EMPLOYER_EMAIL=e2e-employer@test.com
E2E_EMPLOYER_PASSWORD=TestPass123!

E2E_EMPLOYEE_EMAIL=e2e-employee@test.com
E2E_EMPLOYEE_PASSWORD=TestPass123!

# Target workplace ID for review submission tests
E2E_TARGET_WORKPLACE_ID=1
```

### Test Account Setup

**Important:** Before running tests, ensure test accounts exist in your database:

```sql
-- Example: Create employer test account
INSERT INTO users (email, password, role)
VALUES ('e2e-employer@test.com', 'hashed_password', 'EMPLOYER');

-- Example: Create employee test account
INSERT INTO users (email, password, role)
VALUES ('e2e-employee@test.com', 'hashed_password', 'EMPLOYEE');
```

## Running Tests

### Build and Preview

First, build the production bundle:

```bash
pnpm build
```

Start the preview server:

```bash
pnpm preview:e2e
```

### Run E2E Tests

In a separate terminal, run the tests:

```bash
# Headless mode (default)
pnpm test:e2e

# Headed mode (see browser)
pnpm test:e2e:headed
```

### Run Specific Tests

The test runner supports filtering:

```bash
# Run all tests
pnpm test:e2e

# Run tests matching a pattern
node tests/e2e/selenium/run-tests.js workplace

# Run a specific test
node tests/e2e/selenium/run-tests.js 01-workplace-creation

# Run a single test file directly
node tests/e2e/selenium/specs/workplace/01-workplace-creation.test.ts
```

## Writing Tests

**📖 For detailed guide on adding new tests, see [HOW_TO_ADD_TESTS.md](HOW_TO_ADD_TESTS.md)**

### Test Discovery

The test runner **automatically discovers** all `.test.ts` files in the `specs/` directory. No manual registration needed!

### Quick Test Template

```typescript
import { WebDriver } from 'selenium-webdriver';
import { initDriver, quitDriver } from '../../utils/driver.js';
import { LoginPage } from '../../pages/LoginPage.js';
import { takeScreenshotOnFailure } from '../../utils/screenshot.js';

export const testName = 'My Test Name';

export async function runTest(): Promise<boolean> {
  let driver: WebDriver | null = null;

  try {
    // Initialize driver
    driver = await initDriver();

    // Use page objects
    const loginPage = new LoginPage(driver);
    await loginPage.navigate();
    await loginPage.login('user@test.com', 'password');

    // Assertions
    const url = await driver.getCurrentUrl();
    if (!url.includes('/dashboard')) {
      throw new Error('Login failed');
    }

    console.log(`✓ ${testName} PASSED`);
    return true;

  } catch (error) {
    console.error(`❌ ${testName} FAILED`);
    console.error('Error:', error.message);

    if (driver) {
      await takeScreenshotOnFailure(driver, 'test-failure', error);
    }

    return false;

  } finally {
    if (driver) {
      await quitDriver(driver);
    }
  }
}

// Allow running standalone
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runTest()
    .then((passed) => process.exit(passed ? 0 : 1))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
```

### Using Page Objects

```typescript
// Create page object instance
const loginPage = new LoginPage(driver);

// Navigate to page
await loginPage.navigate();

// Interact with elements
await loginPage.enterUsername('testuser');
await loginPage.enterPassword('password');
await loginPage.submit();

// Wait for success
await loginPage.waitForLoginSuccess();
```

### Creating New Page Objects

1. Extend `BasePage`:

```typescript
import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage.js';

export class MyPage extends BasePage {
  // Define locators
  private readonly myButton = By.id('my-button');
  private readonly myInput = By.css('input[name="my-input"]');

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigate(): Promise<void> {
    await this.goto('/my-page');
  }

  async clickButton(): Promise<void> {
    await this.click(this.myButton);
  }

  async fillInput(text: string): Promise<void> {
    await this.type(this.myInput, text);
  }
}
```

## Page Object Model

### BasePage

The `BasePage` class provides common functionality:

- `goto(path)` - Navigate to URL
- `click(locator)` - Click element
- `type(locator, text)` - Type into input
- `getText(locator)` - Get element text
- `waitForElement(locator)` - Wait for element
- `waitForVisible(locator)` - Wait for visibility
- `takeScreenshot(name)` - Capture screenshot
- `executeScript(script)` - Run JavaScript

### Existing Page Objects

#### LoginPage

```typescript
const loginPage = new LoginPage(driver);
await loginPage.navigate();
await loginPage.login(email, password);
await loginPage.waitForLoginSuccess();
```

#### EmployerDashboardPage

```typescript
const dashboard = new EmployerDashboardPage(driver);
await dashboard.navigate();
await dashboard.clickCreateWorkplace();
const workplaceCount = await dashboard.getWorkplaceCards();
```

#### CreateWorkplacePage

```typescript
const createPage = new CreateWorkplacePage(driver);
await createPage.fillWorkplaceForm(workplaceData);
await createPage.submit();
const message = await createPage.waitForSuccess();
```

#### WorkplaceDetailPage

```typescript
const detailPage = new WorkplaceDetailPage(driver);
await detailPage.navigate(workplaceId);
await detailPage.clickWriteReview();
const reviewCount = await detailPage.getReviewCount();
```

#### ReviewFormPage

```typescript
const reviewForm = new ReviewFormPage(driver);
await reviewForm.selectRating(5);
await reviewForm.enterReviewText('Great workplace!');
await reviewForm.submit();
```

## Configuration

### Test Configuration (`config/test.config.ts`)

Loads settings from `.env.e2e`:

```typescript
import { getTestConfig } from '../config/test.config.js';

const config = getTestConfig();
console.log(config.baseUrl); // http://localhost:4173
console.log(config.employer.email); // e2e-employer@test.com
```

### Browser Capabilities (`config/capabilities.ts`)

Chrome options:

- Headless/headed mode
- Window size
- Disable GPU, sandbox (for CI)
- Enable logging
- Accept insecure certificates

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Build application
        run: pnpm build:e2e

      - name: Start preview server
        run: pnpm preview:e2e &

      - name: Wait for server
        run: npx wait-on http://localhost:4173

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          E2E_HEADLESS: true

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-screenshots
          path: tests/e2e/selenium/screenshots/
```

## Troubleshooting

### ChromeDriver Issues

**Error:** `spawn chromedriver.exe ENOENT` or `ChromeDriver not found`

**Cause:** ChromeDriver's install script may be blocked by pnpm's security settings, preventing the binary from being downloaded.

**Solutions (in order):**

1. **Automatic fix (recommended):** The project includes a postinstall script that should handle this automatically. If it didn't run, try:
   ```bash
   pnpm install
   ```

2. **Manual installation:**
   ```bash
   node node_modules/chromedriver/install.js
   ```

3. **Approve chromedriver scripts (if using pnpm):**
   ```bash
   pnpm approve-builds chromedriver
   ```
   Then select chromedriver and reinstall:
   ```bash
   pnpm install
   ```

4. **Verify installation:**
   ```bash
   # Windows PowerShell
   Test-Path "node_modules\chromedriver\lib\chromedriver\chromedriver.exe"
   
   # Linux/Mac
   test -f node_modules/chromedriver/lib/chromedriver/chromedriver
   ```

**Note:** The project includes `.npmrc` with `enable-pre-post-scripts=true` to prevent this issue for new installations.

### Headless Mode Failures

**Error:** Tests pass in headed mode but fail in headless

**Solution:**
- Increase wait times
- Check viewport size
- Verify element visibility
- Use explicit waits

### Element Not Found

**Error:** `NoSuchElementError`

**Solution:**
```typescript
// Add explicit waits
await this.waitForVisible(locator, 10000);

// Try multiple selectors
const selectors = [By.id('btn'), By.css('button')];
for (const selector of selectors) {
  if (await this.elementExists(selector)) {
    await this.click(selector);
    break;
  }
}
```

### Stale Element Reference

**Error:** `StaleElementReferenceError`

**Solution:**
```typescript
// Re-find element
async clickWithRetry(locator: By): Promise<void> {
  for (let i = 0; i < 3; i++) {
    try {
      const element = await this.findElement(locator);
      await element.click();
      return;
    } catch (error) {
      if (i === 2) throw error;
      await sleep(1000);
    }
  }
}
```

### Timeouts

**Error:** `TimeoutError: Waiting for element timed out`

**Solution:**
- Increase timeout values in `.env.e2e`
- Check network speed
- Verify backend is responding
- Use longer waits for API calls

### Screenshots Not Saved

**Error:** Screenshots directory doesn't exist

**Solution:**
```bash
mkdir -p tests/e2e/selenium/screenshots
```

### Backend Connection Issues

**Error:** Cannot connect to backend API

**Solution:**
- Verify `E2E_API_URL` is correct
- Check backend is running
- Test API endpoints manually
- Verify CORS settings

## Best Practices

### 1. Use Page Objects

✅ **Good:**
```typescript
const loginPage = new LoginPage(driver);
await loginPage.login(email, password);
```

❌ **Bad:**
```typescript
await driver.findElement(By.id('email')).sendKeys(email);
await driver.findElement(By.id('password')).sendKeys(password);
await driver.findElement(By.css('button[type="submit"]')).click();
```

### 2. Explicit Waits

✅ **Good:**
```typescript
await this.waitForVisible(locator, 10000);
```

❌ **Bad:**
```typescript
await sleep(5000);
```

### 3. Unique Test Data

✅ **Good:**
```typescript
const workplaceName = `Test Company ${Date.now()}`;
```

❌ **Bad:**
```typescript
const workplaceName = 'Test Company';
```

### 4. Clean Up

✅ **Good:**
```typescript
try {
  // Test code
} finally {
  await quitDriver(driver);
}
```

### 5. Descriptive Errors

✅ **Good:**
```typescript
throw new Error(`Login failed: Expected URL to contain '/dashboard', got '${url}'`);
```

❌ **Bad:**
```typescript
throw new Error('Failed');
```

## Adding New Tests

1. **Create test file** in `specs/`:

```typescript
// specs/my-feature/my-test.spec.ts
```

2. **Import required modules**:

```typescript
import { initDriver, quitDriver } from '../../utils/driver.js';
import { MyPage } from '../../pages/MyPage.js';
```

3. **Write test function**:

```typescript
async function runMyTest() {
  // Test implementation
}
```

4. **Add to test runner**:

```javascript
// run-tests.js
const myTestPassed = await runMyTest();
testResults.push({ name: 'My Test', passed: myTestPassed });
```