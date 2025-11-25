/**
 * Review Form Page Object
 *
 * Page object for workplace review submission form/modal (ReviewFormDialog).
 * This is a modal dialog, not a separate page.
 */

import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage.ts';
import type { ReviewData } from '../fixtures/review.fixtures.ts';

export class ReviewFormPage extends BasePage {
  // Modal container
  private readonly modalDialog = By.css('[role="dialog"][data-slot="dialog-content"]');

  // Form field locators - scoped within the modal dialog
  private readonly titleInput = By.css('[role="dialog"] input[id="title"]');
  private readonly contentTextarea = By.css('[role="dialog"] textarea[id="content"]');
  private readonly anonymousCheckbox = By.css('[role="dialog"] input[id="anonymous"]');
  private readonly submitButton = By.css('[role="dialog"] button[type="submit"]');
  private readonly cancelButton = By.css('[role="dialog"] button[type="button"][variant="outline"]');

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
   * Enter review title (optional)
   */
  async enterTitle(title: string): Promise<void> {
    await this.tryMultipleSelectors(
      [
        this.titleInput,
        By.css('[role="dialog"] input[placeholder*="title" i]'),
      ],
      async (locator) => await this.type(locator, title)
    );
  }

  /**
   * Select rating for a specific ethical policy
   * @param policy - The policy name (translated label) or index
   * @param stars - Rating from 1-5
   */
  async selectPolicyRating(policy: string | number, stars: number): Promise<void> {
    if (stars < 1 || stars > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Try to find by label text (case-insensitive)
    if (typeof policy === 'string') {
      const labelXpath = `//*[@role="dialog"]//label[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${policy.toLowerCase()}')]`;

      try {
        const starButtonXpath = `${labelXpath}/following-sibling::*//button[@aria-label="Rate ${stars} out of 5"]`;
        const starButton = By.xpath(starButtonXpath);

        await this.click(starButton);
        await this.sleep(200);
        return;
      } catch (error) {
        console.log(`Warning: Could not select rating by label for policy "${policy}", falling back to position.`);
      }
    }

    // Fallback: select by position (0-based) among available rating groups
    const index = typeof policy === 'number' ? policy : 0;
    const starButton = By.xpath(`(//*[@role="dialog"]//button[@aria-label="Rate ${stars} out of 5"])[${index + 1}]`);
    await this.click(starButton);
    await this.sleep(200);
  }

  /**
   * Enter review content/comment (optional)
   */
  async enterContent(content: string): Promise<void> {
    await this.tryMultipleSelectors(
      [
        this.contentTextarea,
        By.css('[role="dialog"] textarea[placeholder*="review" i]'),
      ],
      async (locator) => await this.type(locator, content)
    );
  }

  /**
   * Toggle anonymous posting
   */
  async setAnonymous(anonymous: boolean): Promise<void> {
    const possibleCheckboxes = [
      // shadcn checkbox renders a button with role="checkbox"
      By.css('[role="dialog"] [role="checkbox"][id="anonymous"]'),
      By.xpath('//*[@role="dialog"]//*[@role="checkbox" and @id="anonymous"]'),
      By.css('[role="dialog"] button[role="checkbox"]'),
      // fallback to input if implementation changes
      this.anonymousCheckbox,
      By.css('input[id="anonymous"]'),
      By.xpath('//input[@id="anonymous"]'),
    ];

    const checkbox = await this.findFirstExisting(possibleCheckboxes, false);
    if (!checkbox) {
      // Control might be hidden/omitted; do not fail test
      return;
    }

    const isCheckedAttr = await checkbox.getAttribute('aria-checked');
    const dataState = await checkbox.getAttribute('data-state');
    const isChecked =
      isCheckedAttr === 'true' ||
      dataState === 'checked' ||
      (await checkbox.isSelected());

    if (isChecked !== anonymous) {
      // Click label if available, otherwise click the checkbox itself
      const labelSelectors = [
        By.css('[role="dialog"] label[for="anonymous"]'),
        By.css('label[for="anonymous"]'),
      ];
      const label = await this.findFirstExisting(labelSelectors, false);
      if (label) {
        await label.click();
      } else {
        await checkbox.click();
      }
      await this.sleep(150);
    }
  }

  /**
   * Fill complete review form
   */
  async fillReviewForm(reviewData: ReviewData): Promise<void> {
    // Ensure modal is visible
    await this.waitForModal();

    // Fill optional title
    if (reviewData.title) {
      await this.enterTitle(reviewData.title);
    }

    // Select ratings for each policy
    if (reviewData.policyRatings) {
      for (const [policy, rating] of Object.entries(reviewData.policyRatings)) {
        if (rating > 0) {
          await this.selectPolicyRating(policy, rating);
        }
      }
    }

    // Fill optional content
    if (reviewData.content) {
      await this.enterContent(reviewData.content);
    }

    // Set anonymous if specified
    if (reviewData.anonymous !== undefined) {
      await this.setAnonymous(reviewData.anonymous);
    }
  }

  /**
   * Submit review
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
   * Wait for success (modal closes after successful submission)
   */
  async waitForSuccess(timeout: number = 10000): Promise<void> {
    // Wait for the modal to disappear
    try {
      await this.waitForElementToDisappear(this.modalDialog, timeout);
    } catch (error) {
      throw new Error('Modal did not close after submission - review may not have been submitted successfully');
    }
  }

  /**
   * Cancel review submission
   */
  async cancel(): Promise<void> {
    await this.click(this.cancelButton);
  }

  /**
   * Submit complete review (convenience method)
   */
  async submitReview(reviewData: ReviewData): Promise<void> {
    await this.fillReviewForm(reviewData);
    await this.submit();
    await this.waitForSuccess();
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
   * Helper: find the first existing element from a selector list
   */
  private async findFirstExisting(selectors: By[], throwIfMissing: boolean = true) {
    for (const selector of selectors) {
      try {
        // wait briefly for the element to appear
        const element = await this.waitForElement(selector, 2000);
        if (element) {
          return element;
        }
      } catch (error) {
        continue;
      }
    }

    if (throwIfMissing) {
      throw new Error('Element not found for provided selectors');
    }

    return null;
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
