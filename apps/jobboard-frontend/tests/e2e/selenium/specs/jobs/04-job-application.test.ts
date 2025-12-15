/**
 * Job Application Flow E2E Test
 *
 * Covers a real user journey:
 * 1) Login as job seeker
 * 2) Navigate to job listings
 * 3) Select a job
 * 4) Open job detail
 * 5) Submit application (cover letter + special needs + CV upload)
 * 6) Assert success (toast + application appears in My Applications)
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { WebDriver } from 'selenium-webdriver';
import { initDriver, quitDriver } from '../../utils/driver.ts';
import { LoginPage } from '../../pages/LoginPage.ts';
import { JobsPage } from '../../pages/JobsPage.ts';
import { JobDetailPage } from '../../pages/JobDetailPage.ts';
import { JobApplicationPage } from '../../pages/JobApplicationPage.ts';
import { MyApplicationsPage } from '../../pages/MyApplicationsPage.ts';
import { employeeAccount } from '../../fixtures/test-accounts.ts';
import { takeScreenshotOnFailure } from '../../utils/screenshot.ts';
import { logPageInfo } from '../../utils/test-helpers.ts';
import { sleep } from '../../utils/wait.ts';

export const testName = '04-job-application-flow';

function extractJobIdFromUrl(url: string): number | null {
  const match = url.match(/\/jobs\/(\d+)/);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}

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

    // Step 1: Login as Employee/Job Seeker
    console.log('--- Step 1: Login as Job Seeker ---');
    const loginPage = new LoginPage(driver);
    await loginPage.navigate();
    await loginPage.login(employeeAccount.email, employeeAccount.password);
    console.log('[OK] Credentials submitted');

    // Step 1a: OTP Verification (if required)
    console.log('--- Step 1a: Checking for OTP Verification ---');
    await sleep(2000);
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
    } catch {
      console.log('[OK] OTP not required, login successful');
    }

    // Step 2: Navigate to Job Listings
    console.log('--- Step 2: Navigate to Job Listings (/jobs/browse) ---');
    const jobsPage = new JobsPage(driver);
    await jobsPage.navigate();
    console.log('[OK] Jobs browse page loaded');

    const jobCount = await jobsPage.getJobCardCount();
    if (jobCount === 0) {
      throw new Error(
        'No job listings found. Ensure the test environment has at least one job post.'
      );
    }
    console.log(`[OK] Found ${jobCount} job(s)`);

    // Step 3-4: Select a job and open detail page
    console.log('--- Step 3: Select a Job Post ---');
    const jobDetailPage = new JobDetailPage(driver);
    const jobApplicationPage = new JobApplicationPage(driver);

    let selectedJobTitle: string | null = null;
    let selectedJobId: number | null = null;

    // Try a few jobs to avoid the "already applied" redirect.
    const attempts = Math.min(3, jobCount);
    for (let i = 0; i < attempts; i++) {
      console.log(`[INFO] Trying job card index ${i}...`);
      await jobsPage.openJobAtIndex(i);
      await jobDetailPage.waitForLoaded(10000);

      const url = await driver.getCurrentUrl();
      const jobId = extractJobIdFromUrl(url);
      if (!jobId) {
        throw new Error(`Could not extract job id from URL: ${url}`);
      }

      const jobTitle = await jobDetailPage.getJobTitle();
      console.log(`[OK] Opened job detail: "${jobTitle}" (id=${jobId})`);

      // Step 5: Go to application page via Apply button
      console.log('--- Step 4: Open Job Application Page ---');
      await jobDetailPage.clickApplyNow();

      // Wait for application form. If redirected due to already applied, try next job.
      try {
        await jobApplicationPage.waitForUrlContains(`/jobs/${jobId}/apply`, 8000);
        await jobApplicationPage.waitForLoaded(10000);
        selectedJobTitle = jobTitle;
        selectedJobId = jobId;
        break;
      } catch {
        const afterUrl = await driver.getCurrentUrl();
        console.log(`[WARN] Did not land on apply page (url=${afterUrl}). Trying next job...`);
        await driver.navigate().back();
        await jobsPage.navigate();
      }
    }

    if (!selectedJobTitle || !selectedJobId) {
      throw new Error(
        'Could not open a job application page. The user may have already applied to all available jobs.'
      );
    }

    // Step 5: Submit job application
    console.log('--- Step 5: Fill and Submit Application Form ---');
    const coverLetterText =
      'E2E cover letter: I am excited to apply. This submission is generated by Selenium tests.';
    const specialNeedsText = 'E2E special needs: None.';

    await jobApplicationPage.fillCoverLetter(coverLetterText);
    await jobApplicationPage.fillSpecialNeeds(specialNeedsText);

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const resumePath = path.resolve(__dirname, '../../fixtures/sample-resume.pdf');

    await jobApplicationPage.uploadCv(resumePath);
    console.log('[OK] CV uploaded');

    await jobApplicationPage.submit();
    console.log('[OK] Application submitted');

    // Step 6: Verify success
    console.log('--- Step 6: Verify Submission Success ---');
    await jobApplicationPage.waitForSubmissionSuccess(20000);
    console.log('[OK] Success toast detected');

    // Also verify in "My Applications"
    console.log('--- Step 6a: Verify Application Appears in My Applications ---');
    const myApplicationsPage = new MyApplicationsPage(driver);
    await myApplicationsPage.navigate();
    await myApplicationsPage.waitForApplicationWithTitle(selectedJobTitle, 20000);
    console.log(`[OK] Application for "${selectedJobTitle}" is visible in My Applications`);

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
      await takeScreenshotOnFailure(driver, 'job-application-flow-failure', error as Error);
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
const invokedFile = process.argv[1];
if (invokedFile && import.meta.url === `file:///${invokedFile.replace(/\\\\/g, '/')}`) {
  runTest()
    .then((passed) => {
      process.exit(passed ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
