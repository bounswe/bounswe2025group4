/**
 * Jobs Page Object
 *
 * Page object for browsing job listings.
 * Route: /jobs/browse
 */

import { WebDriver, By, WebElement } from 'selenium-webdriver';
import { BasePage } from './BasePage.ts';

export class JobsPage extends BasePage {
  private readonly searchInput = By.id('search-input');

  // JobCard uses a clickable Card (div) without an anchor, so we target the card root.
  // We intentionally use a structural XPath to avoid relying on translated text.
  private readonly jobCards = By.xpath(
    [
      '//div[contains(@class,"space-y-4")]',
      '//div[contains(@class,"cursor-pointer") and contains(@class,"bg-card")',
      ' and .//div[contains(@class,"text-xl") and contains(@class,"font-semibold")]]',
    ].join('')
  );

  constructor(driver: WebDriver) {
    super(driver);
  }

  /**
   * Navigate to jobs browse page
   */
  async navigate(): Promise<void> {
    await this.goto('/jobs/browse');
    await this.waitForPageLoad();
    await this.waitForVisible(this.searchInput, 10000);
  }

  /**
   * Return job cards currently visible on the page
   */
  async getJobCards(): Promise<WebElement[]> {
    return await this.findElements(this.jobCards);
  }

  /**
   * Get number of job cards
   */
  async getJobCardCount(): Promise<number> {
    return await this.getElementCount(this.jobCards);
  }

  /**
   * Click a job card at a given index (0-based)
   */
  async openJobAtIndex(index: number): Promise<void> {
    const cards = await this.getJobCards();
    if (cards.length === 0) {
      throw new Error('No job cards found on /jobs/browse');
    }
    if (index < 0 || index >= cards.length) {
      throw new Error(`Job card index out of bounds: ${index} (found ${cards.length} cards)`);
    }

    const card = cards[index];
    await this.executeScript('arguments[0].scrollIntoView({block: "center"});', card);
    await card.click();
  }
}

