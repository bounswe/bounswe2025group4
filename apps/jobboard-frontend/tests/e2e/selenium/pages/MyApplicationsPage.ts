/**
 * My Applications Page Object
 *
 * Page object for job seeker applications list.
 * Route: /jobs/applications
 */

import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage.ts';

export class MyApplicationsPage extends BasePage {
  private readonly pageHeader = By.xpath('//h1[contains(@class,"text-3xl") and contains(@class,"font-bold")]');

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigate(): Promise<void> {
    await this.goto('/jobs/applications');
    await this.waitForPageLoad();
    await this.waitForVisible(this.pageHeader, 10000);
  }

  async waitForApplicationWithTitle(title: string, timeout: number = 15000): Promise<void> {
    const endTime = Date.now() + timeout;
    const locator = By.xpath(
      `//h3[contains(@class,"text-lg") and contains(., ${this.toXPathLiteral(title)})]`
    );

    while (Date.now() < endTime) {
      if (await this.elementExists(locator)) {
        return;
      }
      await this.refresh();
      await this.waitForVisible(this.pageHeader, 10000);
      await this.sleep(500);
    }

    throw new Error(`Could not find application with title "${title}" on /jobs/applications`);
  }

  private toXPathLiteral(value: string): string {
    if (!value.includes("'")) {
      return `'${value}'`;
    }
    if (!value.includes('"')) {
      return `"${value}"`;
    }
    const parts = value.split("'");
    const concatParts = parts
      .map((part) => `'${part}'`)
      .join(`, "'", `);
    return `concat(${concatParts})`;
  }
}

