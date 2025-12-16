/**
 * Job Detail Page Object
 *
 * Page object for a single job post detail page.
 * Route: /jobs/:id
 */

import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage.ts';

export class JobDetailPage extends BasePage {
  private readonly breadcrumb = By.css('nav[aria-label="Breadcrumb"]');
  private readonly jobTitle = By.xpath('//h1[contains(@class,"font-bold") and contains(@class,"text-foreground")]');

  // "Apply now" is rendered as a Link inside a Button; easiest stable hook is the href.
  private readonly applyLink = By.xpath('//a[contains(@href,"/jobs/") and contains(@href,"/apply")]');

  constructor(driver: WebDriver) {
    super(driver);
  }

  async waitForLoaded(timeout: number = 10000): Promise<void> {
    await this.waitForVisible(this.breadcrumb, timeout);
    await this.waitForVisible(this.jobTitle, timeout);
  }

  async getJobTitle(): Promise<string> {
    return await this.getText(this.jobTitle, 10000);
  }

  async clickApplyNow(): Promise<void> {
    await this.click(this.applyLink, 10000);
  }
}

