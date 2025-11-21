/**
 * Create Workplace Page Object
 *
 * Page object for the workplace creation modal/form.
 */

import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage.ts';
import type { WorkplaceData } from '../fixtures/workplace.fixtures.ts';

export class CreateWorkplacePage extends BasePage {
  // Form field locators - will need adjustment based on actual implementation
  private readonly nameInput = By.css(
    'input[name="name"], input[id="name"], input[aria-label*="Name"]'
  );
  private readonly descriptionInput = By.css(
    'textarea[name="description"], textarea[id="description"], textarea[aria-label*="Description"]'
  );
  private readonly industryInput = By.css(
    'input[name="industry"], select[name="industry"], input[id="industry"]'
  );
  private readonly locationInput = By.css(
    'input[name="location"], input[id="location"], input[aria-label*="Location"]'
  );
  private readonly websiteInput = By.css(
    'input[name="website"], input[id="website"], input[aria-label*="Website"]'
  );
  private readonly ethicalPoliciesInput = By.css(
    'textarea[name="ethicalPolicies"], textarea[name="ethical_policies"], textarea[id="ethicalPolicies"]'
  );
  private readonly submitButton = By.css(
    'button[type="submit"], button[aria-label*="Create"], button:contains("Create")'
  );
  private readonly cancelButton = By.css(
    'button[aria-label*="Cancel"], button:contains("Cancel")'
  );

  // Toast/success message
  private readonly toastAlert = By.css('[role="alert"]');

  constructor(driver: WebDriver) {
    super(driver);
  }

  /**
   * Fill workplace name
   */
  async fillName(name: string): Promise<void> {
    await this.tryMultipleSelectors(
      [
        this.nameInput,
        By.css('input[placeholder*="name" i]'),
      ],
      async (locator) => await this.type(locator, name)
    );
  }

  /**
   * Fill workplace description
   */
  async fillDescription(description: string): Promise<void> {
    await this.tryMultipleSelectors(
      [
        this.descriptionInput,
        By.css('textarea[placeholder*="description" i]'),
      ],
      async (locator) => await this.type(locator, description)
    );
  }

  /**
   * Fill industry
   */
  async fillIndustry(industry: string): Promise<void> {
    await this.tryMultipleSelectors(
      [
        this.industryInput,
      ],
      async (locator) => await this.type(locator, industry)
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
   * Fill ethical policies
   */
  async fillEthicalPolicies(policies: string): Promise<void> {
    await this.tryMultipleSelectors(
      [
        this.ethicalPoliciesInput,
        By.css('textarea[name="ethical_policies"]'),
        By.css('textarea[aria-label*="Ethical"]'),
      ],
      async (locator) => await this.type(locator, policies)
    );
  }

  /**
   * Fill all workplace form fields
   */
  async fillWorkplaceForm(data: WorkplaceData): Promise<void> {
    await this.fillName(data.name);
    await this.fillDescription(data.description);
    await this.fillIndustry(data.industry);
    await this.fillLocation(data.location);
    await this.fillWebsite(data.website);
    await this.fillEthicalPolicies(data.ethicalPolicies);
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
   * Wait for success toast
   */
  async waitForSuccess(timeout: number = 10000): Promise<string> {
    const toast = await this.waitForVisible(this.toastAlert, timeout);
    return await toast.getText();
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
