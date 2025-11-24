/**
 * Create Workplace Page Object
 *
 * Page object for the workplace creation modal/form.
 */

import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage.ts';
import type { WorkplaceData } from '../fixtures/workplace.fixtures.ts';

export class CreateWorkplacePage extends BasePage {
  // Modal container - using Radix UI Dialog
  private readonly modalDialog = By.css('[role="dialog"][data-slot="dialog-content"]');

  // Form field locators - scoped within the modal dialog
  private readonly companyNameInput = By.css(
    '[role="dialog"] input[id="modal-companyName"], [role="dialog"] input[name="companyName"]'
  );
  private readonly sectorInput = By.css(
    '[role="dialog"] input[id="modal-sector"], [role="dialog"] input[name="sector"]'
  );
  private readonly locationInput = By.css(
    '[role="dialog"] input[id="modal-location"], [role="dialog"] input[name="location"]'
  );
  private readonly websiteInput = By.css(
    '[role="dialog"] input[id="modal-website"], [role="dialog"] input[name="website"]'
  );
  private readonly shortDescriptionInput = By.css(
    '[role="dialog"] textarea[id="modal-shortDescription"], [role="dialog"] textarea[name="shortDescription"]'
  );
  private readonly detailedDescriptionInput = By.css(
    '[role="dialog"] textarea[id="modal-detailedDescription"], [role="dialog"] textarea[name="detailedDescription"]'
  );
  private readonly submitButton = By.css(
    '[role="dialog"] button[type="submit"]'
  );
  private readonly cancelButton = By.css(
    '[role="dialog"] button[type="button"]:not([type="submit"])'
  );

  // Success message - displayed in the modal after creation
  private readonly successTitle = By.xpath('//*[@role="dialog"]//*[contains(text(), "Workplace Created") or contains(text(), "workplaceCreated")]');

  // Ethical tags dropdown - scoped within the modal
  private readonly ethicalTagsDropdownTrigger = By.css('[role="dialog"] button[aria-label*="Select"]');

  constructor(driver: WebDriver) {
    super(driver);
  }

  /**
   * Wait for the modal to be visible
   */
  async waitForModal(timeout: number = 5000): Promise<void> {
    await this.waitForVisible(this.modalDialog, timeout);
  }

  /**
   * Fill company name
   */
  async fillCompanyName(name: string): Promise<void> {
    await this.tryMultipleSelectors(
      [
        this.companyNameInput,
        By.css('input[placeholder*="company" i]'),
      ],
      async (locator) => await this.type(locator, name)
    );
  }

  /**
   * Fill sector
   */
  async fillSector(sector: string): Promise<void> {
    await this.tryMultipleSelectors(
      [
        this.sectorInput,
        By.css('input[placeholder*="sector" i]'),
      ],
      async (locator) => await this.type(locator, sector)
    );
  }

  /**
   * Fill location
   */
  async fillLocation(location: string): Promise<void> {
    await this.tryMultipleSelectors(
      [
        this.locationInput,
        By.css('input[placeholder*="location" i]'),
      ],
      async (locator) => await this.type(locator, location)
    );
  }

  /**
   * Fill website URL
   */
  async fillWebsite(website: string): Promise<void> {
    await this.tryMultipleSelectors(
      [
        this.websiteInput,
        By.css('input[type="url"]'),
      ],
      async (locator) => await this.type(locator, website)
    );
  }

  /**
   * Fill short description
   */
  async fillShortDescription(description: string): Promise<void> {
    await this.tryMultipleSelectors(
      [
        this.shortDescriptionInput,
        By.css('textarea[placeholder*="brief" i]'),
      ],
      async (locator) => await this.type(locator, description)
    );
  }

  /**
   * Fill detailed description
   */
  async fillDetailedDescription(description: string): Promise<void> {
    await this.tryMultipleSelectors(
      [
        this.detailedDescriptionInput,
        By.css('textarea[placeholder*="mission" i]'),
      ],
      async (locator) => await this.type(locator, description)
    );
  }

  /**
   * Select ethical tags from dropdown
   * @param tags - Array of ethical tag names to select (e.g., ['Salary Transparency', 'Remote-Friendly'])
   */
  async selectEthicalTags(tags: string[]): Promise<void> {
    // Ensure modal is visible first
    await this.waitForVisible(this.modalDialog, 5000);

    // Click the dropdown trigger to open the menu
    await this.tryMultipleSelectors(
      [
        this.ethicalTagsDropdownTrigger,
        By.css('[role="dialog"] button[aria-label*="ethical"]'),
        By.xpath('//*[@role="dialog"]//button[contains(., "Select") or contains(., "selected")]'),
      ],
      async (locator) => await this.click(locator)
    );

    // Wait for dropdown menu to appear (dropdown is rendered in a portal, not inside dialog)
    await this.sleep(800);

    // Select each tag by clicking on the checkbox item
    for (const tag of tags) {
      try {
        // Find the dropdown menu item with the tag text
        // The dropdown menu is rendered outside the dialog in a portal
        const tagItem = By.xpath(`//*[@role="menuitemcheckbox"][contains(., "${tag}")]`);
        await this.click(tagItem);
        await this.sleep(300); // Small delay between selections
      } catch (error) {
        console.log(`Warning: Could not select ethical tag "${tag}"`);
      }
    }

    // Close the dropdown by pressing Escape
    await this.driver.actions().sendKeys('\uE00C').perform(); // ESC key
    await this.sleep(500);
  }

  /**
   * Fill all workplace form fields
   */
  async fillWorkplaceForm(data: WorkplaceData): Promise<void> {
    await this.fillCompanyName(data.companyName);
    await this.fillSector(data.sector);
    await this.fillLocation(data.location);

    // Optional fields
    if (data.website) {
      await this.fillWebsite(data.website);
    }
    if (data.shortDescription) {
      await this.fillShortDescription(data.shortDescription);
    }
    if (data.detailedDescription) {
      await this.fillDetailedDescription(data.detailedDescription);
    }

    // Select ethical tags if provided
    if (data.ethicalTags && data.ethicalTags.length > 0) {
      await this.selectEthicalTags(data.ethicalTags);
    }
  }

  /**
   * Submit the form
   */
  async submit(): Promise<void> {
    await this.tryMultipleSelectors(
      [
        this.submitButton,
        By.xpath('//button[contains(text(), "Submit")]'),
        By.css('[data-testid="submit-workplace"]'),
      ],
      async (locator) => await this.click(locator)
    );
  }

  /**
   * Wait for success message in modal
   */
  async waitForSuccess(timeout: number = 10000): Promise<string> {
    // Try modal success message first
    try {
      const successElement = await this.waitForVisible(this.successTitle, timeout / 2);
      return await successElement.getText();
    } catch (error) {
      // If no modal success, fall back to navigation/toast checks
    }

    // Fallback 1: Wait for URL to contain workplace detail path
    try {
      await this.waitForUrlContains('/workplace/', timeout / 2);
      return 'Redirected to workplace page';
    } catch (error) {
      // Continue to next fallback
    }

    // Fallback 2: Look for toast/alert indicating success
    try {
      const toast = await this.waitForVisible(By.css('[role="alert"]'), timeout / 2);
      return await toast.getText();
    } catch (error) {
      // No toast found
    }

    throw new Error('Workplace creation success confirmation not found');
  }

  /**
   * Cancel form
   */
  async cancel(): Promise<void> {
    await this.click(this.cancelButton);
  }

  /**
   * Helper: Try multiple selectors until one works
   */
  private async tryMultipleSelectors(
    selectors: By[],
    action: (locator: By) => Promise<void>
  ): Promise<void> {
    for (const selector of selectors) {
      try {
        const exists = await this.elementExists(selector);
        if (exists) {
          await action(selector);
          return;
        }
      } catch (error) {
        // Try next selector
        continue;
      }
    }

    throw new Error(`None of the selectors worked for action`);
  }
}
