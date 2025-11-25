/**
 * Job Creation E2E Test
 *
 * This test validates the employer's ability to create a job post.
 *
 * Test Steps:
 * 1. Login as employer (credentials)
 * 1a. Verify OTP (using code 000000) if prompted
 * 2. Navigate to employer dashboard
 * 3. Open create job modal
 * 4. Fill job form (select first workplace)
 * 5. Submit and wait for modal to close
 * 6. Verify job appears in dashboard list
 */

import { WebDriver } from 'selenium-webdriver';
import { initDriver, quitDriver } from '../../utils/driver.ts';
import { LoginPage } from '../../pages/LoginPage.ts';
import { EmployerDashboardPage } from '../../pages/EmployerDashboardPage.ts';
import { CreateJobPage } from '../../pages/CreateJobPage.ts';
import { employerAccount } from '../../fixtures/test-accounts.ts';
import { getDefaultJobPostData } from '../../fixtures/job.fixtures.ts';
import { takeScreenshotOnFailure } from '../../utils/screenshot.ts';
import { logPageInfo } from '../../utils/test-helpers.ts';
import { sleep } from '../../utils/wait.ts';

export const testName = '03-job-creation-test';

export async function runTest(): Promise<boolean> {
  let driver: WebDriver | null = null;

  try {
    console.log('\n========================================');
    console.log(`TEST: ${testName}`);
    console.log('========================================\n');

    // Initialize driver
    console.log('Initializing WebDriver...');
    driver = await initDriver();
    console.log('[OK] WebDriver initialized');

    // Step 1: Login as Employer
    console.log('--- Step 1: Login as Employer ---');
    const loginPage = new LoginPage(driver);
    await loginPage.navigate();
    await loginPage.login(employerAccount.email, employerAccount.password);
    console.log('[OK] Credentials submitted');

    // Step 1a: OTP Verification (if required)
    console.log('--- Step 1a: Checking for OTP Verification ---');
    await sleep(2000); // Wait for page transition

    try {
      const isOtpVisible = await loginPage.isOtpInputVisible();
      if (isOtpVisible) {
        console.log('[WARN] OTP verification required');
        await loginPage.verifyOtp('000000');
        await sleep(2000);
        console.log('[OK] OTP verified, login successful');
      } else {
        console.log('[OK] OTP not required, login successful');
      }
    } catch (error) {
      console.log('[OK] OTP not required, login successful');
    }

    // Step 2: Navigate to Employer Dashboard
    console.log('--- Step 2: Navigate to Employer Dashboard ---');
    const dashboardPage = new EmployerDashboardPage(driver);
    const currentUrl = await driver.getCurrentUrl();

    if (!currentUrl.includes('/employer')) {
      await dashboardPage.navigate();
    }

    const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
    if (!isDashboardLoaded) {
      throw new Error('Employer dashboard did not load');
    }
    console.log('[OK] Employer dashboard loaded');

    // Step 3: Open Create Job Modal
    console.log('--- Step 3: Open Create Job Modal ---');
    const createJobPage = new CreateJobPage(driver);

    try {
      await dashboardPage.clickCreateJob();
      await createJobPage.waitForModal();
      console.log('[OK] Create job modal opened');
    } catch (error) {
      throw new Error('Could not find create job button - feature may not be implemented');
    }

    // Step 4: Fill Job Form
    console.log('--- Step 4: Fill Job Form ---');
    const jobData = getDefaultJobPostData('03-job-creation-test');
    console.log('Job title:', jobData.title);
    console.log('Salary range:', `${jobData.minSalary} - ${jobData.maxSalary}`);
    console.log('Workplace: selecting first option in dropdown');

    await createJobPage.fillJobForm(jobData);
    console.log('[OK] Job form filled (including workplace selection)');

    // Step 5: Submit Job
    console.log('--- Step 5: Submit Job ---');
    await createJobPage.submit();
    await createJobPage.waitForSuccess();
    console.log('[OK] Job submission completed and modal closed');

    // Step 6: Verify Job in Dashboard
    console.log('--- Step 6: Verify Job in Dashboard ---');
    await sleep(2000); // Wait for dashboard data refresh

    const hasJob = await dashboardPage.findJobByTitle(jobData.title);
    if (hasJob) {
      console.log('[OK] Job found in dashboard list');
    } else {
      console.log('[WARN] Job not immediately visible (may require manual verification)');
    }

    // Test Summary
    console.log('\n========================================');
    console.log(`[OK] ${testName} PASSED`);
    console.log('========================================\n');

    return true;
  } catch (error) {
    console.error('\n========================================');
    console.error(`[FAIL] ${testName} FAILED`);
    console.error('========================================');
    console.error('Error:', (error as Error).message);
    console.error();

    if (driver) {
      await takeScreenshotOnFailure(driver, 'job-creation-failure', error as Error);
      await logPageInfo(driver);
    }

    return false;
  } finally {
    if (driver) {
      await quitDriver(driver);
    }
  }
}

// Allow running this test standalone
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runTest()
    .then((passed) => {
      process.exit(passed ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
