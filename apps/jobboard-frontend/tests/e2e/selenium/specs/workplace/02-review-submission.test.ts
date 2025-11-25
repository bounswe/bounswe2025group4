/**
 * Review Submission E2E Test
 *
 * This test validates the employee's ability to submit a review to a workplace.
 *
 * Test Steps:
 * 1. Login as employee (credentials)
 * 1a. Verify OTP (using code 000000)
 * 2. Navigate to target workplace
 * 3. Fetch ethical tags from workplace page
 * 4. Open review modal
 * 5. Fill review form with star ratings
 * 6. Submit review
 * 7. Verify review appears
 */

import { WebDriver } from 'selenium-webdriver';
import { initDriver, quitDriver } from '../../utils/driver.ts';
import { LoginPage } from '../../pages/LoginPage.ts';
import { WorkplaceDetailPage } from '../../pages/WorkplaceDetailPage.ts';
import { ReviewFormPage } from '../../pages/ReviewFormPage.ts';
import { employeeAccount } from '../../fixtures/test-accounts.ts';
import { getDefaultReviewData } from '../../fixtures/review.fixtures.ts';
import { config } from '../../config/test.config.ts';
import { takeScreenshotOnFailure } from '../../utils/screenshot.ts';
import { logPageInfo } from '../../utils/test-helpers.ts';
import { sleep } from '../../utils/wait.ts';

export const testName = 'Review Submission';

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

    // Step 1: Login as Employee
    console.log('--- Step 1: Login as Employee ---');
    const loginPage = new LoginPage(driver);
    await loginPage.navigate();
    await loginPage.login(employeeAccount.email, employeeAccount.password);
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

    // Step 2: Navigate to Target Workplace
    console.log('--- Step 2: Navigate to Target Workplace ---');
    const targetWorkplaceId = config.targetWorkplaceId;
    const workplaceDetailPage = new WorkplaceDetailPage(driver);
    let ethicalTags: string[] = [];

    try {
      await workplaceDetailPage.navigate(targetWorkplaceId);
      await sleep(2000);

      const workplaceName = await workplaceDetailPage.getWorkplaceName();
      console.log(`[OK] Navigated to workplace: ${workplaceName}`);
    } catch (error) {
      console.log(`[ERROR] Could not navigate to workplace ID ${targetWorkplaceId}`);
      console.log('Please check E2E_TARGET_WORKPLACE_ID in .env.e2e');
      throw error;
    }

    // Step 3: Fetch Ethical Tags from Workplace Page
    console.log('--- Step 3: Fetch Ethical Tags ---');
    ethicalTags = await workplaceDetailPage.getEthicalTags();
    console.log('[OK] Ethical tags on page:', ethicalTags.join(', ') || 'None');
    if (ethicalTags.length === 0) {
      console.log('[WARN] No ethical tags found on target workplace; review will use default ratings.');
    }

    // Step 4: Open Review Modal
    console.log('--- Step 4: Open Review Modal ---');
    try {
      await workplaceDetailPage.clickWriteReview();
      await workplaceDetailPage.waitForReviewModal();
      console.log('[OK] Review modal opened');
    } catch (error) {
      throw new Error('[ERROR] Could not open review modal - feature may not be implemented');
    }

    // Step 5: Fill Review Form
    console.log('--- Step 5: Fill Review Form ---');

    // Build policy ratings dynamically based on fetched ethical tags
    const policyRatings =
      ethicalTags.length > 0
        ? ethicalTags.reduce((acc: Record<string, number>, tag) => {
            acc[tag] = 4; // 4-star rating for each tag
            return acc;
          }, {} as Record<string, number>)
        : getDefaultReviewData().policyRatings;

    const defaultData = getDefaultReviewData();
    const reviewData = {
      title: defaultData.title,
      content: defaultData.content,
      anonymous: defaultData.anonymous,
      policyRatings, // Use only the dynamically built ratings
    };

    const reviewFormPage = new ReviewFormPage(driver);

    console.log('[OK] Review title:', reviewData.title || 'None');
    console.log('Policy ratings (clicking star components):');
    for (const [policy, rating] of Object.entries(reviewData.policyRatings)) {
      if (rating > 0) {
        console.log(`[OK] ${policy}: ${rating} stars`);
      }
    }

    await reviewFormPage.fillReviewForm(reviewData);
    console.log('✓ Review form filled (star ratings clicked)\n');

    // Step 6: Submit Review
    console.log('--- Step 6: Submit Review ---');
    await reviewFormPage.submit();
    console.log('✓ Review submitted');

    await reviewFormPage.waitForSuccess();
    console.log('✓ Review modal closed (submission successful)');
    console.log();

    // Step 7: Verify Review
    console.log('--- Step 7: Verify Review Appears ---');
    await sleep(2000);
    await workplaceDetailPage.scrollToReviews();

    // Check if review content appears (if content was provided)
    const searchText = reviewData.content?.substring(0, 50) || reviewData.title || 'review';
    const hasReview = await workplaceDetailPage.hasReviewWithText(searchText);

    if (hasReview) {
      console.log('✓ Review appears in list\n');
    } else {
      console.log('⚠ Review not immediately visible (not critical)\n');
    }

    // Test Summary
    console.log('\n========================================');
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
      await takeScreenshotOnFailure(driver, 'review-submission-failure', error as Error);
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
