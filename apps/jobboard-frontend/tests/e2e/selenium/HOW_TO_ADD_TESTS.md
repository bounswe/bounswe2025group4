# How to Add New E2E Tests

This guide explains how to extend the Selenium E2E test suite with new tests.

## Quick Start

The test runner **automatically discovers** all test files in the `specs/` directory. Just create a new `.test.ts` file and it will be picked up!

## Test File Structure

Every test file must follow this structure:

```typescript
/**
 * Test documentation
 */

import { WebDriver } from 'selenium-webdriver';
import { initDriver, quitDriver } from '../../utils/driver.js';
// ... other imports

// REQUIRED: Export test name
export const testName = 'My Test Name';

// REQUIRED: Export async runTest function that returns boolean
export async function runTest(): Promise<boolean> {
  let driver: WebDriver | null = null;

  try {
    // Initialize driver
    driver = await initDriver();

    // Your test logic here
    // ...

    console.log(`✓ ${testName} PASSED`);
    return true; // Test passed

  } catch (error) {
    console.error(`❌ ${testName} FAILED`);
    console.error('Error:', error.message);

    if (driver) {
      await takeScreenshotOnFailure(driver, 'my-test-failure', error);
    }

    return false; // Test failed

  } finally {
    // Always clean up
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

## Step-by-Step Guide

### 1. Create Test File

Create a new file in `specs/` directory:

```
tests/e2e/selenium/specs/
├── workplace/
│   ├── 01-workplace-creation.test.ts
│   ├── 02-workplace-review-submission.test.ts
│   └── 03-workplace-creation-and-review.test.ts
├── jobs/                           # New category
│   └── 01-job-application.test.ts  # Your new test!
└── mentorship/                     # Another category
    └── 01-mentorship-request.test.ts
```

**Naming Convention:**
- Use `.test.ts` extension (required!)
- Prefix with numbers for execution order: `01-`, `02-`, etc.
- Use kebab-case: `my-feature-test.test.ts`
- Group related tests in subdirectories

### 2. Import Required Utilities

```typescript
// Driver management
import { initDriver, quitDriver } from '../../utils/driver.js';

// Page objects
import { LoginPage } from '../../pages/LoginPage.js';
import { MyFeaturePage } from '../../pages/MyFeaturePage.js';

// Test data
import { employerAccount } from '../../fixtures/test-accounts.js';

// Utilities
import { takeScreenshotOnFailure } from '../../utils/screenshot.js';
import { sleep } from '../../utils/wait.js';
import { config } from '../../config/test.config.js';
```

### 3. Define Test Metadata

```typescript
// This will appear in test reports
export const testName = 'Job Application Submission';
```

### 4. Implement Test Logic

```typescript
export async function runTest(): Promise<boolean> {
  let driver: WebDriver | null = null;

  try {
    console.log(`\nTEST: ${testName}`);

    // Initialize
    driver = await initDriver();

    // Test steps
    const loginPage = new LoginPage(driver);
    await loginPage.navigate();
    await loginPage.login('user@test.com', 'password');

    // More test logic...

    return true; // Success!

  } catch (error) {
    // Handle failure
    if (driver) {
      await takeScreenshotOnFailure(driver, 'test-name', error);
    }
    return false;

  } finally {
    // Cleanup
    await quitDriver(driver);
  }
}
```

### 5. Add Standalone Runner

```typescript
// This allows running the test individually
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runTest()
    .then((passed) => process.exit(passed ? 0 : 1))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
```

## Running Tests

### Run All Tests

```bash
pnpm test:e2e
```

### Run Specific Test

```bash
# Run tests matching pattern
node tests/e2e/selenium/run-tests.js workplace

# Run specific test file
node tests/e2e/selenium/run-tests.js 01-job-application
```

### Run Test File Directly

```bash
node tests/e2e/selenium/specs/jobs/01-job-application.test.ts
```

## Creating Page Objects

If your test needs new page objects, create them in `pages/`:

```typescript
// pages/JobApplicationPage.ts
import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage.js';

export class JobApplicationPage extends BasePage {
  private readonly resumeInput = By.id('resume');
  private readonly submitButton = By.css('button[type="submit"]');

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigate(jobId: string): Promise<void> {
    await this.goto(`/jobs/${jobId}/apply`);
  }

  async uploadResume(filePath: string): Promise<void> {
    await this.type(this.resumeInput, filePath);
  }

  async submit(): Promise<void> {
    await this.click(this.submitButton);
  }
}
```

## Best Practices

### ✅ DO

- **Use descriptive test names**: "Job Application with Valid Resume"
- **Import page objects**: Reuse existing page objects
- **Add console output**: Log progress through test steps
- **Handle errors gracefully**: Try/catch with screenshots
- **Clean up resources**: Always quit driver in finally block
- **Use fixtures**: Leverage test data from fixtures/
- **Wait properly**: Use explicit waits, not sleep()

### ❌ DON'T

- **Hard-code selectors** in tests (use page objects)
- **Use fixed delays** (use wait utilities)
- **Skip cleanup** (always quit driver)
- **Forget error handling** (always catch and screenshot)
- **Use real user data** (use test fixtures)

## Example: Complete Test

```typescript
/**
 * Job Application E2E Test
 *
 * Tests the complete job application workflow.
 */

import { WebDriver } from 'selenium-webdriver';
import { initDriver, quitDriver } from '../../utils/driver.js';
import { LoginPage } from '../../pages/LoginPage.js';
import { JobsPage } from '../../pages/JobsPage.js';
import { JobApplicationPage } from '../../pages/JobApplicationPage.js';
import { employeeAccount } from '../../fixtures/test-accounts.js';
import { takeScreenshotOnFailure } from '../../utils/screenshot.js';
import { sleep } from '../../utils/wait.js';

export const testName = 'Job Application Submission';

export async function runTest(): Promise<boolean> {
  let driver: WebDriver | null = null;

  try {
    console.log(`\n========================================`);
    console.log(`TEST: ${testName}`);
    console.log(`========================================\n`);

    driver = await initDriver();

    // Step 1: Login
    console.log('--- Step 1: Login as Employee ---');
    const loginPage = new LoginPage(driver);
    await loginPage.navigate();
    await loginPage.login(employeeAccount.email, employeeAccount.password);
    await sleep(2000);
    console.log('✓ Login successful\n');

    // Step 2: Browse Jobs
    console.log('--- Step 2: Browse Jobs ---');
    const jobsPage = new JobsPage(driver);
    await jobsPage.navigate();
    const firstJob = await jobsPage.getFirstJob();
    console.log(`✓ Found job: ${firstJob.title}\n`);

    // Step 3: Apply
    console.log('--- Step 3: Submit Application ---');
    const applicationPage = new JobApplicationPage(driver);
    await applicationPage.navigate(firstJob.id);
    await applicationPage.uploadResume('/path/to/resume.pdf');
    await applicationPage.submit();
    console.log('✓ Application submitted\n');

    console.log(`✓ ${testName} PASSED\n`);
    return true;

  } catch (error) {
    console.error(`❌ ${testName} FAILED`);
    console.error('Error:', (error as Error).message);

    if (driver) {
      await takeScreenshotOnFailure(driver, 'job-application-failure', error as Error);
    }

    return false;

  } finally {
    if (driver) {
      await quitDriver(driver);
    }
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runTest()
    .then((passed) => process.exit(passed ? 0 : 1))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
```

## Debugging Tests

### Run in Headed Mode

```bash
# See browser during test execution
pnpm test:e2e:headed
```

### Add Debug Output

```typescript
import { logPageInfo } from '../../utils/test-helpers.js';

// In your test
await logPageInfo(driver); // Logs URL and title
```

### Take Manual Screenshots

```typescript
await driver.takeScreenshot().then((data) => {
  require('fs').writeFileSync('debug.png', data, 'base64');
});
```

## Test Organization

```
specs/
├── auth/              # Authentication tests
│   ├── 01-login.test.ts
│   └── 02-registration.test.ts
├── jobs/              # Job-related tests
│   ├── 01-job-listing.test.ts
│   └── 02-job-application.test.ts
├── workplace/         # Workplace tests
│   ├── 01-workplace-creation.test.ts
│   └── 02-workplace-review.test.ts
├── mentorship/        # Mentorship tests
│   └── 01-mentorship-request.test.ts
└── forum/             # Forum tests
    └── 01-forum-post.test.ts
```

## Common Patterns

### Conditional Test Steps

```typescript
let featureAvailable = true;

try {
  await page.clickFeatureButton();
} catch (error) {
  console.log('⚠ Feature not available, skipping...');
  featureAvailable = false;
}

if (featureAvailable) {
  // Continue with feature-specific steps
}
```

### Multiple Assertions

```typescript
const errors = [];

if (!(await page.hasElement())) {
  errors.push('Element not found');
}

if (!(await page.verifyText('Expected'))) {
  errors.push('Text mismatch');
}

if (errors.length > 0) {
  throw new Error(`Assertions failed:\n${errors.join('\n')}`);
}
```

## That's It!

The test runner will automatically:
- ✅ Discover your test file
- ✅ Run it in sequence with other tests
- ✅ Report results
- ✅ Capture screenshots on failure

Just create the file and run `pnpm test:e2e`!
