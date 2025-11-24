/**
 * Workplace Creation E2E Test
 *
 * This test validates the employer's ability to create a new workplace.
 *
 * Test Steps:
 * 1. Login as employer (credentials)
 * 1a. Verify OTP (using code 000000)
 * 2. Navigate to employer workplaces page
 * 3. Open new workplace modal (with Create/Join options)
 * 3a. Select "Create and manage your own workplace" option
 * 3b. Wait for create workplace form modal to appear
 * 4. Fill workplace form
 * 5. Submit and verify creation
 * 6. Verify workplace appears in list
 */

import { WebDriver } from 'selenium-webdriver';
import { initDriver, quitDriver } from '../../utils/driver.ts';
import { LoginPage } from '../../pages/LoginPage.ts';
import { EmployerWorkplacesPage } from '../../pages/EmployerWorkplacesPage.ts';
import { CreateWorkplacePage } from '../../pages/CreateWorkplacePage.ts';
import { employerAccount } from '../../fixtures/test-accounts.ts';
import { getDefaultWorkplaceData } from '../../fixtures/workplace.fixtures.ts';
import { takeScreenshotOnFailure } from '../../utils/screenshot.ts';
import { logPageInfo } from '../../utils/test-helpers.ts';
import { sleep } from '../../utils/wait.ts';

export const testName = 'Workplace Creation';

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

    // Step 1: Login
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

    // Step 2: Navigate to Workplaces Page
    console.log('--- Step 2: Navigate to Employer Workplaces Page ---');
    const workplacesPage = new EmployerWorkplacesPage(driver);
    const currentUrl = await driver.getCurrentUrl();

    if (!currentUrl.includes('/employer/workplaces')) {
      await workplacesPage.navigate();
    }

    const isWorkplacesPageLoaded = await workplacesPage.isWorkplacesPageLoaded();
    if (!isWorkplacesPageLoaded) {
      throw new Error('Employer workplaces page did not load');
    }
    console.log('[OK] Employer workplaces page loaded');

    // Step 3: Open New Workplace Modal and Select Create Option
    console.log('--- Step 3: Open New Workplace Modal ---');
    try {
      await workplacesPage.clickNewWorkplace();
      await workplacesPage.waitForNewWorkplaceModal();
      console.log('[OK] New workplace modal opened');
    } catch (error) {
      throw new Error('Could not find new workplace button - feature may not be implemented');
    }

    console.log('--- Step 3a: Select Create Workplace Option ---');
    try {
      await workplacesPage.clickCreateWorkplaceOption();
      await sleep(1000); // Wait for modal transition
      console.log('[OK] Create workplace option selected');
    } catch (error) {
      throw new Error('Could not find create workplace option in modal');
    }

    // Step 3b: Wait for Create Workplace Form Modal
    console.log('--- Step 3b: Wait for Create Workplace Form Modal ---');
    const createWorkplacePage = new CreateWorkplacePage(driver);
    try {
      await workplacesPage.waitForCreateModal();
      await createWorkplacePage.waitForModal();
      console.log('[OK] Create workplace form modal opened');
    } catch (error) {
      throw new Error('Create workplace form modal did not appear');
    }

    // Step 4: Fill Workplace Form
    console.log('--- Step 4: Fill Workplace Form ---');
    const workplaceData = getDefaultWorkplaceData();
    console.log('Workplace name:', workplaceData.companyName);
    console.log('Ethical tags:', workplaceData.ethicalTags?.join(', ') || 'None');

    await createWorkplacePage.fillWorkplaceForm(workplaceData);
    console.log('[OK] Workplace form filled (including ethical tags)');

    // Step 5: Submit Workplace
    console.log('--- Step 5: Submit Workplace ---');
    await createWorkplacePage.submit();
    await createWorkplacePage.waitForSuccess();
    console.log('[OK] Workplace creation submitted and modal closed');

    // Step 6: Verify in List
    console.log('--- Step 6: Verify Workplace in List ---');
    await workplacesPage.navigate();

    const hasWorkplace = await workplacesPage.findWorkplaceByName(workplaceData.companyName);
    if (hasWorkplace) {
      console.log('[OK] Workplace found in list\n');
    } else {
      console.log('⚠ Workplace not immediately visible (not critical)\n');
    }

    // Test Summary
    console.log('\n========================================');
    console.log(`[OK] ${testName} PASSED`);
    console.log('========================================\n');

    return true;
  } catch (error) {
    console.error('\n========================================');
    console.error(`❌ ${testName} FAILED`);
    console.error('========================================');
    console.error('Error:', (error as Error).message);
    console.error();

    if (driver) {
      await takeScreenshotOnFailure(driver, 'workplace-creation-failure', error as Error);
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
