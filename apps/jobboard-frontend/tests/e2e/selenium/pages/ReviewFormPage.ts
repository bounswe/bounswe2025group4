/**
 * Review Form Page Object
 *
 * Page object for workplace review submission form/modal.
 */

import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage.ts';
import type { ReviewData } from '../fixtures/review.fixtures.ts';

export class ReviewFormPage extends BasePage {
  // Locators
  private readonly ratingStars = By.css('[data-rating], .rating-star, input[type="radio"]');
  private readonly reviewTextArea = By.css(
    'textarea[name="review"], textarea[name="text"], textarea[aria-label*="Review"]'
  );
  private readonly submitButton = By.css(
    'button[type="submit"], button:contains("Submit"), button:contains("Post")'
  );
  private readonly cancelButton = By.css('button:contains("Cancel")');
  private readonly toastAlert = By.css('[role="alert"]');

  constructor(driver: WebDriver) {
    super(driver);
  }

  /**
   * Select star rating (1-5)
   */
  async selectRating(stars: number): Promise<void> {
    if (stars < 1 || stars > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Try different rating implementations
    const selectors = [
      // Radio buttons with value
      By.css(`input[type="radio"][value="${stars}"]`),
      // Star icons with data-rating
      By.css(`[data-rating="${stars}"]`),
      // Star buttons
      By.css(`.star-${stars}`),
      // Nth star element
      By.xpath(`(//button[contains(@class, 'star') or contains(@aria-label, 'star')])[${stars}]`),
      // Slider input
      By.css('input[type="range"]'),
      // Fallback to general rating stars locator
      this.ratingStars,
    ];

    for (const selector of selectors) {
      try {
        const exists = await this.elementExists(selector);
        if (exists) {
          const element = await this.findElement(selector);

          // If it's a range input, set value
          const tagName = await element.getTagName();
          if (tagName === 'input') {
            const type = await element.getAttribute('type');
            if (type === 'range') {
              await this.executeScript(
                `arguments[0].value = ${stars}; arguments[0].dispatchEvent(new Event('input', { bubbles: true }));`,
                element
              );
              return;
            }
          }

          // Otherwise, click it
          await element.click();
          return;
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error(`Could not find rating selector for ${stars} stars`);
  }

  /**
   * Enter review text
   */
  async enterReviewText(text: string): Promise<void> {
    await this.tryMultipleSelectors(
      [
        this.reviewTextArea,
        By.css('textarea[name="comment"]'),
        By.css('textarea[placeholder*="review" i]'),
        By.css('textarea'),
      ],
      async (locator) => await this.type(locator, text)
    );
  }

  /**
   * Fill complete review form
   */
  async fillReviewForm(reviewData: ReviewData): Promise<void> {
    await this.selectRating(reviewData.rating);
    await this.enterReviewText(reviewData.text);
  }

  /**
   * Submit review
   */
  async submit(): Promise<void> {
    await this.tryMultipleSelectors(
      [
        this.submitButton,
        By.css('[data-testid="submit-review"]'),
      ],
      async (locator) => await this.click(locator)
    );
  }

  /**
   * Wait for success message
   */
  async waitForSuccess(timeout: number = 10000): Promise<string> {
    const toast = await this.waitForVisible(this.toastAlert, timeout);
    return await toast.getText();
  }

  /**
   * Cancel review submission
   */
  async cancel(): Promise<void> {
    await this.click(this.cancelButton);
  }

  /**
   * Submit complete review
   */
  async submitReview(reviewData: ReviewData): Promise<void> {
    await this.fillReviewForm(reviewData);
    await this.submit();
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
}
