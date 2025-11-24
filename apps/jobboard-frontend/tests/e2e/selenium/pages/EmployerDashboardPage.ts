/**
 * Employer Dashboard Page Object
 *
 * Page object for the employer dashboard where employers can manage their workplaces.
 */

import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage.ts';

export class EmployerDashboardPage extends BasePage {
  // Locators - These will need to be updated based on actual implementation
  private readonly createWorkplaceButton = By.css(
    'button[aria-label*="Create"], button:has-text("Create Workplace"), [data-testid="create-workplace-btn"]'
  );
  private readonly createJobButton = By.xpath(
    '//button[contains(., "Create Job") or contains(., "createJob")]'
  );
  private readonly workplaceCards = By.css('[data-testid="workplace-card"], .workplace-card');
  private readonly workplaceModal = By.css('[role="dialog"], .modal');

  constructor(driver: WebDriver) {
    super(driver);
  }

  /**
   * Navigate to employer dashboard
   */
  async navigate(): Promise<void> {
    await this.goto('/employer/dashboard');
    await this.waitForPageLoad();
  }

  /**
   * Click create workplace button
   */
  async clickCreateWorkplace(): Promise<void> {
    const possibleSelectors = [
      // When workplaces exist - "New Workplace" button with Plus icon
      By.xpath('//button[contains(., "New Workplace") or contains(., "newWorkplace")]'),
      By.css('button:has(svg) + button:has(svg)'), // The first button in the workplace actions
      this.createWorkplaceButton,
    ];

    for (const selector of possibleSelectors) {
      try {
        const exists = await this.elementExists(selector);
        if (exists) {
          await this.click(selector);
          return;
        }
      } catch (error) {
        // Try next selector
        continue;
      }
    }

    throw new Error('Create workplace button not found');
  }

  /**
   * Click create job button (global or within workplace)
   */
  async clickCreateJob(): Promise<void> {
    const possibleSelectors = [
      this.createJobButton,
      By.xpath('//button[contains(., "Post New Job") or contains(., "post new job")]'),
      By.css('[data-testid="create-job-btn"]'),
    ];

    for (const selector of possibleSelectors) {
      try {
        const exists = await this.elementExists(selector);
        if (exists) {
          await this.click(selector);
          return;
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error('Create job button not found');
  }

  /**
   * Wait for create workplace modal to appear
   */
  async waitForCreateModal(timeout: number = 5000): Promise<void> {
    await this.waitForVisible(this.workplaceModal, timeout);
  }

  /**
   * Get all workplace cards
   */
  async getWorkplaceCards(): Promise<number> {
    try {
      return await this.getElementCount(this.workplaceCards);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if dashboard has loaded
   */
  async isDashboardLoaded(): Promise<boolean> {
    try {
      await this.waitForPageLoad();
      const url = await this.getCurrentUrl();
      return url.includes('/employer/dashboard') || url.includes('/employer');
    } catch (error) {
      return false;
    }
  }

  /**
   * Find workplace by name
   */
  async findWorkplaceByName(name: string): Promise<boolean> {
    try {
      const xpath = By.xpath(`//*[contains(text(), "${name}")]`);
      return await this.elementExists(xpath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Find job posting by title on dashboard tables
   */
  async findJobByTitle(title: string): Promise<boolean> {
    const selectors = [
      By.xpath(`//table//div[contains(@class, "font-semibold") and contains(., "${title}")]`),
      By.xpath(`//table//td[contains(., "${title}")]`),
      By.xpath(`//*[contains(text(), "${title}") and ancestor::table]`),
    ];

    for (const selector of selectors) {
      try {
        if (await this.elementExists(selector)) {
          return true;
        }
      } catch (error) {
        continue;
      }
    }

    return false;
  }
}
