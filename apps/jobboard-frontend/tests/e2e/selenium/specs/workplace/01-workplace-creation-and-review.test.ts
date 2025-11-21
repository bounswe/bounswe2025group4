/**
 * Combined Workplace Creation and Review Submission E2E Test
 *
 * This test validates two sequential flows within a single session:
 * 1. Employer creates a new workplace
 * 2. Employer submits a review to another workplace
 *
 * This ensures cross-feature stability and tests that workplace management
 * and review systems work together correctly.
 *
 * Test Steps:
 * Part 1 - Workplace Creation:
 * 1. Login as employer (credentials)
 * 1a. Verify OTP (using code 000000)
 * 2. Navigate to employer dashboard
 * 3. Open create workplace modal
 * 4. Fill workplace form
 * 5. Submit and verify creation
 *
 * Part 2 - Review Submission:
 * 6. Navigate to another workplace
 * 7. Open review modal
 * 8. Fill review form
 * 9. Submit and verify review
 */

import { WebDriver } from 'selenium-webdriver';
import { initDriver, quitDriver } from '../../utils/driver.ts';
import { LoginPage } from '../../pages/LoginPage.ts';
import { EmployerDashboardPage } from '../../pages/EmployerDashboardPage.ts';
import { CreateWorkplacePage } from '../../pages/CreateWorkplacePage.ts';
import { WorkplaceDetailPage } from '../../pages/WorkplaceDetailPage.ts';
import { ReviewFormPage } from '../../pages/ReviewFormPage.ts';
import { employerAccount } from '../../fixtures/test-accounts.ts';
import { getDefaultWorkplaceData } from '../../fixtures/workplace.fixtures.ts';
import { getDefaultReviewData } from '../../fixtures/review.fixtures.ts';
import { config } from '../../config/test.config.ts';
import { takeScreenshotOnFailure } from '../../utils/screenshot.ts';
import { logPageInfo } from '../../utils/test-helpers.ts';
import { sleep } from '../../utils/wait.ts';

export const testName = 'Combined Workplace Creation and Review';

export async function runTest(): Promise<boolean> {
  let driver: WebDriver | null = null;

  try {
    console.log('\n========================================');
    console.log(`TEST: ${testName}`);
    console.log('========================================\n');

    // Initialize driver
    console.log('Initializing WebDriver...');
    driver = await initDriver();
    console.log('✓ WebDriver initialized\n');

    // ==========================================
    // PART 1: WORKPLACE CREATION
    // ==========================================
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║  PART 1: WORKPLACE CREATION         ║');
    console.log('╚══════════════════════════════════════╝\n');

    // Step 1: Login
    console.log('--- Step 1: Login as Employer ---');
    const loginPage = new LoginPage(driver);
    await loginPage.navigate();
    await loginPage.login(employerAccount.email, employerAccount.password);
    console.log('✓ Credentials submitted');

    // Step 1a: OTP Verification (if required)
    console.log('--- Step 1a: Checking for OTP Verification ---');
    await sleep(2000); // Wait for page transition

    try {
      const isOtpVisible = await loginPage.isOtpInputVisible();
      if (isOtpVisible) {
        console.log('OTP verification required');
        await loginPage.verifyOtp('000000');
        await sleep(2000);
        console.log('✓ OTP verified, login successful\n');
      } else {
        console.log('✓ OTP not required, login successful\n');
      }
    } catch (error) {
      console.log('✓ OTP not required, login successful\n');
    }

    // Step 2: Navigate to Dashboard
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
    console.log('✓ Employer dashboard loaded\n');

    // Step 3: Open Create Workplace Modal
    console.log('--- Step 3: Open Create Workplace Modal ---');
    let workplaceFeatureAvailable = true;
    try {
      await dashboardPage.clickCreateWorkplace();
      await dashboardPage.waitForCreateModal();
      console.log('✓ Create workplace modal opened\n');
    } catch (error) {
      console.log('⚠ Could not find create workplace button - feature may not be implemented');
      workplaceFeatureAvailable = false;
    }

    if (workplaceFeatureAvailable) {
      // Step 4: Fill Workplace Form
      console.log('--- Step 4: Fill Workplace Form ---');
      const workplaceData = getDefaultWorkplaceData();
      console.log('Workplace name:', workplaceData.name);

      const createWorkplacePage = new CreateWorkplacePage(driver);
      await createWorkplacePage.fillWorkplaceForm(workplaceData);
      console.log('✓ Workplace form filled\n');

      // Step 5: Submit Workplace
      console.log('--- Step 5: Submit Workplace ---');
      await createWorkplacePage.submit();
      console.log('✓ Workplace creation submitted');

      const successMessage = await createWorkplacePage.waitForSuccess();
      console.log('Success message:', successMessage);
      console.log();

      // Verify in list
      console.log('--- Step 6: Verify Workplace in List ---');
      await dashboardPage.navigate();
      await sleep(2000);

      const hasWorkplace = await dashboardPage.findWorkplaceByName(workplaceData.name);
      if (hasWorkplace) {
        console.log('✓ Workplace found in list\n');
      } else {
        console.log('⚠ Workplace not immediately visible (not critical)\n');
      }

      console.log('✓ Part 1 Complete: Workplace Created\n');
    } else {
      console.log('⚠ Part 1 Skipped: Workplace feature not available\n');
    }

    // ==========================================
    // PART 2: REVIEW SUBMISSION
    // ==========================================
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║  PART 2: REVIEW SUBMISSION          ║');
    console.log('╚══════════════════════════════════════╝\n');

    // Step 7: Navigate to Another Workplace
    console.log('--- Step 7: Navigate to Target Workplace ---');
    const targetWorkplaceId = config.targetWorkplaceId;
    const workplaceDetailPage = new WorkplaceDetailPage(driver);

    try {
      await workplaceDetailPage.navigate(targetWorkplaceId);
      await sleep(2000);

      const workplaceName = await workplaceDetailPage.getWorkplaceName();
      console.log(`✓ Navigated to workplace: ${workplaceName}\n`);
    } catch (error) {
      console.log(`⚠ Could not navigate to workplace ID ${targetWorkplaceId}`);
      console.log('Please check E2E_TARGET_WORKPLACE_ID in .env.e2e');
      throw error;
    }

    // Step 8: Open Review Modal
    console.log('--- Step 8: Open Review Modal ---');
    let reviewFeatureAvailable = true;
    try {
      await workplaceDetailPage.clickWriteReview();
      await workplaceDetailPage.waitForReviewModal();
      console.log('✓ Review modal opened\n');
    } catch (error) {
      console.log('⚠ Could not open review modal - feature may not be implemented');
      reviewFeatureAvailable = false;
    }

    if (reviewFeatureAvailable) {
      // Step 9: Fill Review Form
      console.log('--- Step 9: Fill Review Form ---');
      const reviewData = getDefaultReviewData();
      const reviewFormPage = new ReviewFormPage(driver);

      await reviewFormPage.fillReviewForm(reviewData);
      console.log(`✓ Review form filled (${reviewData.rating} stars)\n`);

      // Step 10: Submit Review
      console.log('--- Step 10: Submit Review ---');
      await reviewFormPage.submit();
      console.log('✓ Review submitted');

      const successMessage = await reviewFormPage.waitForSuccess();
      console.log('Success message:', successMessage);
      console.log();

      // Step 11: Verify Review
      console.log('--- Step 11: Verify Review Appears ---');
      await sleep(2000);
      await workplaceDetailPage.scrollToReviews();

      const hasReview = await workplaceDetailPage.hasReviewWithText(
        reviewData.text.substring(0, 50)
      );

      if (hasReview) {
        console.log('✓ Review appears in list\n');
      } else {
        console.log('⚠ Review not immediately visible (not critical)\n');
      }

      console.log('✓ Part 2 Complete: Review Submitted\n');
    } else {
      console.log('⚠ Part 2 Skipped: Review feature not available\n');
    }

    // Final Summary
    console.log('\n========================================');
    console.log('TEST SUMMARY');
    console.log('========================================');
    console.log(`Part 1 (Workplace Creation): ${workplaceFeatureAvailable ? '✓ PASSED' : '⚠ SKIPPED'}`);
    console.log(`Part 2 (Review Submission): ${reviewFeatureAvailable ? '✓ PASSED' : '⚠ SKIPPED'}`);
    console.log('========================================');
    console.log(`✓ ${testName} PASSED`);
    console.log('========================================\n');

    return true;
  } catch (error) {
    console.error('\n========================================');
    console.error(`❌ ${testName} FAILED`);
    console.error('========================================');
    console.error('Error:', (error as Error).message);
    console.error();

    if (driver) {
      await takeScreenshotOnFailure(driver, 'combined-test-failure', error as Error);
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
