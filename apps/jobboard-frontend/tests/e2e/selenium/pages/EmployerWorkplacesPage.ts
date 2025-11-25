/**
 * Employer Workplaces Page Object
 *
 * Page object for the employer workplaces page where employers can manage their workplaces.
 */

import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage.ts';

export class EmployerWorkplacesPage extends BasePage {
  // Locators based on EmployerWorkplacesPage.tsx
  private readonly newWorkplaceButton = By.xpath('//button[contains(., "New Workplace") or contains(., "newWorkplace")]');
  private readonly viewApplicationsButton = By.xpath('//button[contains(., "View Applications") or contains(., "viewApplications")]');
  private readonly workplaceCards = By.css('[data-testid="workplace-card"], .workplace-card');
  private readonly addNewWorkplaceCard = By.css('div[role="button"], div.cursor-pointer.border-dashed');
  private readonly createWorkplaceModal = By.css('[role="dialog"], .modal');
  private readonly emptyStateCard = By.css('.text-center:has(h2)');
  
  // NewWorkplaceModal locators
  private readonly newWorkplaceModal = By.css('[role="dialog"]');
  private readonly createWorkplaceOption = By.xpath('//*[@role="dialog"]//*[contains(text(), "Create and manage your own workplace")]');
  private readonly joinWorkplaceOption = By.xpath('//*[@role="dialog"]//*[contains(text(), "Request to join an existing workplace")]');

  constructor(driver: WebDriver) {
    super(driver);
  }

  /**
   * Navigate to employer workplaces page
   */
  async navigate(): Promise<void> {
    await this.goto('/employer/workplaces');
    await this.waitForPageLoad();
  }

  /**
   * Click new workplace button
   */
  async clickNewWorkplace(): Promise<void> {
    const possibleSelectors = [
      this.newWorkplaceButton,
      // Fallback: Plus icon button
      By.css('button:has(svg.lucide-plus)'),
      // Fallback: Add new workplace card
      this.addNewWorkplaceCard,
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

    throw new Error('New workplace button not found');
  }

  /**
   * Click view applications button
   */
  async clickViewApplications(): Promise<void> {
    const possibleSelectors = [
      this.viewApplicationsButton,
      // Fallback: ListChecks icon button
      By.css('button:has(svg.lucide-list-checks)'),
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

    throw new Error('View applications button not found');
  }

  /**
   * Wait for NewWorkplaceModal to appear (the modal with Create/Join options)
   */
  async waitForNewWorkplaceModal(timeout: number = 5000): Promise<void> {
    await this.waitForVisible(this.newWorkplaceModal, timeout);
    // Also wait for the title to ensure it's fully loaded
    const titleLocator = By.xpath('//*[@role="dialog"]//*[contains(text(), "New Workplace")]');
    await this.waitForVisible(titleLocator, timeout);
  }

  /**
   * Click on "Create and manage your own workplace" option in NewWorkplaceModal
   */
  async clickCreateWorkplaceOption(): Promise<void> {
    const possibleSelectors = [
      // Card element containing the text "Create and manage your own workplace"
      By.xpath('//*[@role="dialog"]//*[contains(@class, "cursor-pointer")][contains(., "Create and manage your own workplace")]'),
      // Card element containing Plus icon (lucide-plus)
      By.xpath('//*[@role="dialog"]//*[contains(@class, "cursor-pointer")][.//*[contains(@class, "lucide-plus")]]'),
      // Direct text match (fallback)
      this.createWorkplaceOption,
      // SVG Plus icon parent card
      By.xpath('//*[@role="dialog"]//*[contains(@class, "lucide-plus")]/ancestor::*[contains(@class, "cursor-pointer")]'),
    ];

    for (const selector of possibleSelectors) {
      try {
        const exists = await this.elementExists(selector);
        if (exists) {
          await this.click(selector);
          await this.sleep(500); // Small delay for modal transition
          return;
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error('Create workplace option not found in NewWorkplaceModal');
  }

  /**
   * Click on "Request to join an existing workplace" option in NewWorkplaceModal
   */
  async clickJoinWorkplaceOption(): Promise<void> {
    const possibleSelectors = [
      // Card element containing the text "Request to join an existing workplace"
      By.xpath('//*[@role="dialog"]//*[contains(@class, "cursor-pointer")][contains(., "Request to join an existing workplace")]'),
      // Card element containing UserPlus icon (lucide-user-plus)
      By.xpath('//*[@role="dialog"]//*[contains(@class, "cursor-pointer")][.//*[contains(@class, "lucide-user-plus")]]'),
      // Direct text match (fallback)
      this.joinWorkplaceOption,
      // SVG UserPlus icon parent card
      By.xpath('//*[@role="dialog"]//*[contains(@class, "lucide-user-plus")]/ancestor::*[contains(@class, "cursor-pointer")]'),
    ];

    for (const selector of possibleSelectors) {
      try {
        const exists = await this.elementExists(selector);
        if (exists) {
          await this.click(selector);
          await this.sleep(500); // Small delay for modal transition
          return;
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error('Join workplace option not found in NewWorkplaceModal');
  }

  /**
   * Wait for create workplace modal to appear (after selecting Create option)
   */
  async waitForCreateModal(timeout: number = 5000): Promise<void> {
    await this.waitForVisible(this.createWorkplaceModal, timeout);
  }

  /**
   * Get all workplace cards count
   */
  async getWorkplaceCardsCount(): Promise<number> {
    try {
      return await this.getElementCount(this.workplaceCards);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if workplaces page has loaded
   */
  async isWorkplacesPageLoaded(): Promise<boolean> {
    try {
      await this.waitForPageLoad();
      const url = await this.getCurrentUrl();
      return url.includes('/employer/workplaces') || url.includes('/employer');
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
   * Check if empty state is visible
   */
  async isEmptyStateVisible(): Promise<boolean> {
    try {
      return await this.elementExists(this.emptyStateCard);
    } catch (error) {
      return false;
    }
  }
}
