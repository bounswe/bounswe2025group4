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
    // Try multiple selectors for flexibility
    const possibleSelectors = [
      this.createWorkplaceButton,
      By.css('a[href*="create"]'),
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
}
