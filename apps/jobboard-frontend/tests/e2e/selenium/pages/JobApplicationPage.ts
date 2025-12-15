/**
 * Job Application Page Object
 *
 * Page object for job application form submission.
 * Route: /jobs/:id/apply
 */

import path from 'path';
import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage.ts';

export class JobApplicationPage extends BasePage {
  private readonly coverLetter = By.id('coverLetter');
  private readonly specialNeeds = By.id('specialNeeds');
  private readonly fileInput = By.css('input[type="file"]');
  private readonly submitButton = By.css('button[type="submit"]');

  // React-Toastify toasts
  private readonly successToast = By.css('.Toastify__toast--success');
  private readonly errorToast = By.css('.Toastify__toast--error');
  private readonly anyToastAlert = By.css('[role="alert"]');

  constructor(driver: WebDriver) {
    super(driver);
  }

  async waitForLoaded(timeout: number = 10000): Promise<void> {
    await this.waitForVisible(this.coverLetter, timeout);
    await this.waitForVisible(this.specialNeeds, timeout);
    await this.waitForElement(this.fileInput, timeout);
    await this.waitForVisible(this.submitButton, timeout);
  }

  async fillCoverLetter(text: string): Promise<void> {
    await this.type(this.coverLetter, text);
  }

  async fillSpecialNeeds(text: string): Promise<void> {
    await this.type(this.specialNeeds, text);
  }

  /**
   * Upload CV by sending an absolute path to the hidden file input.
   * WebDriver requires an absolute path on the local filesystem.
   */
  async uploadCv(filePath: string): Promise<void> {
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
    const input = await this.waitForElement(this.fileInput, 10000);
    await input.sendKeys(absolutePath);
  }

  async submit(): Promise<void> {
    await this.click(this.submitButton, 10000);
  }

  /**
   * Wait for a success toast after submitting the application.
   * If an error toast appears first, it throws with the toast text.
   */
  async waitForSubmissionSuccess(timeout: number = 15000): Promise<void> {
    const endTime = Date.now() + timeout;
    let lastToastText = '';

    while (Date.now() < endTime) {
      if (await this.elementExists(this.anyToastAlert)) {
        try {
          lastToastText = await this.getToastText();
        } catch {
          // ignore
        }
      }

      if (await this.elementExists(this.errorToast)) {
        const errorText = await this.getToastText();
        throw new Error(`Application submission failed (toast): ${errorText}`);
      }

      if (await this.elementExists(this.successToast)) {
        const successText = await this.getToastText();
        const lower = successText.toLowerCase();
        if (lower.includes('submitted')) {
          return;
        }
        // Success toasts sometimes contain only a short title, still accept it.
        return;
      }

      await this.sleep(250);
    }

    throw new Error(
      `Timed out waiting for application submission success toast. Last toast: "${lastToastText}"`
    );
  }

  private async getToastText(): Promise<string> {
    try {
      const toast = await this.waitForVisible(this.anyToastAlert, 3000);
      return await toast.getText();
    } catch {
      return '';
    }
  }
}
