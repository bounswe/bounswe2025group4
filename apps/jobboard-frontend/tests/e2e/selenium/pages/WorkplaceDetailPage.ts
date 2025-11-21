/**
 * Workplace Detail Page Object
 *
 * Page object for viewing workplace details and submitting reviews.
 */

import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage.ts';

export class WorkplaceDetailPage extends BasePage {
  // Locators
  private readonly workplaceName = By.css('h1, [data-testid="workplace-name"]');
  private readonly writeReviewButton = By.css(
    'button[aria-label*="Review"], button:contains("Write Review"), button:contains("Add Review")'
  );
  private readonly reviewModal = By.css('[role="dialog"], .modal');
  private readonly reviews = By.css('[data-testid="review"], .review-card');

  constructor(driver: WebDriver) {
    super(driver);
  }

  /**
   * Navigate to workplace detail page
   */
  async navigate(workplaceId: string | number): Promise<void> {
    await this.goto(`/workplace/${workplaceId}`);
    await this.waitForPageLoad();
  }

  /**
   * Get workplace name
   */
  async getWorkplaceName(): Promise<string> {
    try {
      return await this.getText(this.workplaceName);
    } catch (error) {
      // Try alternative selector
      const h1 = await this.findElement(By.css('h1'));
      return await h1.getText();
    }
  }

  /**
   * Click write review button
   */
  async clickWriteReview(): Promise<void> {
    const possibleSelectors = [
      this.writeReviewButton,
      By.xpath('//button[contains(text(), "Review")]'),
      By.css('[data-testid="write-review-btn"]'),
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

    throw new Error('Write review button not found');
  }

  /**
   * Wait for review modal to appear
   */
  async waitForReviewModal(timeout: number = 5000): Promise<void> {
    await this.waitForVisible(this.reviewModal, timeout);
  }

  /**
   * Get review count
   */
  async getReviewCount(): Promise<number> {
    try {
      return await this.getElementCount(this.reviews);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if review with text exists
   */
  async hasReviewWithText(text: string): Promise<boolean> {
    try {
      const xpath = By.xpath(`//*[contains(text(), "${text}")]`);
      return await this.elementExists(xpath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Scroll to reviews section
   */
  async scrollToReviews(): Promise<void> {
    try {
      await this.executeScript('window.scrollTo(0, document.body.scrollHeight * 0.5);');
    } catch (error) {
      // Ignore scroll errors
    }
  }
}
