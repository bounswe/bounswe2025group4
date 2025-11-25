/**
 * Create Job Page Object
 *
 * Page object for the job creation modal/form.
 */

import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage.ts';
import type { JobPostData } from '../fixtures/job.fixtures.ts';

export class CreateJobPage extends BasePage {
  // Modal container
  private readonly modalDialog = By.css('[role="dialog"][data-slot="dialog-content"]');

  // Workplace selector (dropdown trigger and menu items)
  private readonly workplaceDropdownTrigger = By.css(
    '[role="dialog"] button[aria-haspopup="menu"], [role="dialog"] button[role="combobox"]'
  );
  private readonly workplaceMenuItems = By.css(
    '[role="menu"] [role="menuitem"], [role="menu"] [role="menuitemradio"], [role="menu"] [role="menuitemcheckbox"]'
  );

  // Form field locators - scoped within the modal dialog
  private readonly titleInput = By.css('[role="dialog"] input[id="title"]');
  private readonly descriptionTextarea = By.css('[role="dialog"] textarea[id="description"]');
  private readonly remoteCheckbox = By.css('[role="dialog"] [id="remote"]');
  private readonly minSalaryInput = By.css('[role="dialog"] input[id="minSalary"]');
  private readonly maxSalaryInput = By.css('[role="dialog"] input[id="maxSalary"]');
  private readonly contactEmailInput = By.css('[role="dialog"] input[id="contactEmail"]');
  private readonly inclusiveOpportunityCheckbox = By.css(
    '[role="dialog"] [id="inclusiveOpportunity"]'
  );
  private readonly submitButton = By.css('[role="dialog"] button[type="submit"]');

  constructor(driver: WebDriver) {
    super(driver);
  }

  /**
   * Wait for the modal to be visible
   */
  async waitForModal(timeout: number = 8000): Promise<void> {
    await this.waitForVisible(this.modalDialog, timeout);
  }

  /**
   * Select the first workplace from the dropdown
   */
  async selectFirstWorkplace(): Promise<void> {
    await this.openWorkplaceDropdown();

    const selectors = [
      this.workplaceMenuItems,
      By.css('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]'),
    ];

    for (const selector of selectors) {
      try {
        await this.waitForElement(selector, 5000);
        const items = await this.findElements(selector);
        if (items.length > 0) {
          await items[0].click();
          await this.sleep(300);
          return;
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error('Could not select workplace - no options found');
  }

  /**
   * Fill job title
   */
  async fillTitle(title: string): Promise<void> {
    await this.tryMultipleSelectors(
      [
        this.titleInput,
        By.css('[role="dialog"] input[placeholder*="title" i]'),
      ],
      async (locator) => await this.type(locator, title)
    );
  }

  /**
   * Fill job description
   */
  async fillDescription(description: string): Promise<void> {
    await this.tryMultipleSelectors(
      [
        this.descriptionTextarea,
        By.css('[role="dialog"] textarea[placeholder*="description" i]'),
      ],
      async (locator) => await this.type(locator, description)
    );
  }

  /**
   * Set remote checkbox
   */
  async setRemote(remote: boolean): Promise<void> {
    await this.setCheckboxState(this.remoteCheckbox, remote);
  }

  /**
   * Fill salary range
   */
  async fillSalaryRange(minSalary: number, maxSalary: number): Promise<void> {
    await this.type(this.minSalaryInput, minSalary.toString());
    await this.type(this.maxSalaryInput, maxSalary.toString());
  }

  /**
   * Fill contact email
   */
  async fillContactEmail(email: string): Promise<void> {
    await this.type(this.contactEmailInput, email);
  }

  /**
   * Set inclusive opportunity checkbox
   */
  async setInclusiveOpportunity(enabled: boolean): Promise<void> {
    await this.setCheckboxState(this.inclusiveOpportunityCheckbox, enabled);
  }

  /**
   * Fill full job form
   */
  async fillJobForm(data: JobPostData): Promise<void> {
    await this.waitForModal();
    await this.selectFirstWorkplace();
    await this.fillTitle(data.title);
    await this.fillDescription(data.description);
    await this.setRemote(data.remote);
    await this.fillSalaryRange(data.minSalary, data.maxSalary);
    await this.fillContactEmail(data.contactEmail);
    await this.setInclusiveOpportunity(data.inclusiveOpportunity);
  }

  /**
   * Submit the job form
   */
  async submit(): Promise<void> {
    await this.tryMultipleSelectors(
      [
        this.submitButton,
        By.xpath('//*[@role="dialog"]//button[@type="submit"]'),
      ],
      async (locator) => await this.click(locator)
    );
  }

  /**
   * Wait for success (modal closes after submission)
   */
  async waitForSuccess(timeout: number = 10000): Promise<void> {
    await this.waitForElementToDisappear(this.modalDialog, timeout);
  }

  /**
   * Open workplace dropdown
   */
  private async openWorkplaceDropdown(): Promise<void> {
    const triggers = [
      this.workplaceDropdownTrigger,
      By.xpath('//*[@role="dialog"]//button[contains(@aria-haspopup, "menu")]'),
      By.xpath('//*[@role="dialog"]//button[contains(@class, "justify-between")]'),
    ];

    await this.tryMultipleSelectors(triggers, async (locator) => {
      await this.click(locator);
      await this.sleep(300);
    });
  }

  /**
   * Helper: set checkbox/radix toggle to desired state
   */
  private async setCheckboxState(locator: By, shouldBeChecked: boolean): Promise<void> {
    const element = await this.waitForElement(locator, 5000);
    const ariaChecked = await element.getAttribute('aria-checked');
    const dataState = await element.getAttribute('data-state');
    const isChecked = ariaChecked === 'true' || dataState === 'checked';

    if (isChecked !== shouldBeChecked) {
      await element.click();
      await this.sleep(200);
    }
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
        continue;
      }
    }

    throw new Error('None of the selectors worked for action');
  }

  /**
   * Helper: Wait for element to disappear
   */
  private async waitForElementToDisappear(locator: By, timeout: number): Promise<void> {
    const endTime = Date.now() + timeout;

    while (Date.now() < endTime) {
      try {
        const exists = await this.elementExists(locator);
        if (!exists) {
          return;
        }
        await this.sleep(100);
      } catch (error) {
        return;
      }
    }

    throw new Error('Element did not disappear within timeout');
  }
}
