/**
 * Login Page Object
 *
 * Page object for the login page.
 */

import { WebDriver, By } from 'selenium-webdriver';
import { BasePage } from './BasePage.ts';

export class LoginPage extends BasePage {
  // Locators
  private readonly usernameInput = By.id('username');
  private readonly passwordInput = By.id('password');
  private readonly rememberMeCheckbox = By.id('rememberMe');
  private readonly submitButton = By.css('button[type="submit"]');
  private readonly registerLink = By.css('a[href="/register"]');
  private readonly forgotPasswordLink = By.css('a[href="/forgot-password"]');

  // OTP verification locators
  private readonly otpInput = By.id('otp');
  private readonly verifyOtpButton = By.css('button[type="submit"]'); // Same submit button used for OTP

  // Toast notification
  private readonly toastAlert = By.css('[role="alert"]');

  constructor(driver: WebDriver) {
    super(driver);
  }

  /**
   * Navigate to login page
   */
  async navigate(): Promise<void> {
    await this.goto('/login');
    await this.waitForPageLoad();
  }

  /**
   * Enter username
   */
  async enterUsername(username: string): Promise<void> {
    await this.type(this.usernameInput, username);
  }

  /**
   * Enter password
   */
  async enterPassword(password: string): Promise<void> {
    await this.type(this.passwordInput, password);
  }

  /**
   * Check/uncheck remember me checkbox
   */
  async setRememberMe(checked: boolean): Promise<void> {
    const checkbox = await this.findElement(this.rememberMeCheckbox);
    const isChecked = await checkbox.isSelected();

    if (isChecked !== checked) {
      await this.click(this.rememberMeCheckbox);
    }
  }

  /**
   * Click submit button
   */
  async submit(): Promise<void> {
    await this.click(this.submitButton);
  }

  /**
   * Complete login with username and password
   */
  async login(username: string, password: string, rememberMe: boolean = false): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);

    if (rememberMe) {
      await this.setRememberMe(true);
    }

    await this.submit();
  }

  /**
   * Wait for OTP input to appear
   */
  async waitForOtpInput(timeout: number = 10000): Promise<void> {
    await this.waitForVisible(this.otpInput, timeout);
  }

  /**
   * Check if OTP input is visible
   */
  async isOtpInputVisible(): Promise<boolean> {
    return await this.elementExists(this.otpInput);
  }

  /**
   * Enter OTP code
   */
  async enterOtp(otp: string): Promise<void> {
    await this.type(this.otpInput, otp);
  }

  /**
   * Click verify OTP button
   */
  async submitOtp(): Promise<void> {
    await this.click(this.verifyOtpButton);
  }

  /**
   * Complete OTP verification
   */
  async verifyOtp(otp: string): Promise<void> {
    await this.waitForOtpInput();
    await this.enterOtp(otp);
    await this.submitOtp();
  }

  /**
   * Complete login with username, password, and OTP verification
   */
  async loginWithOtp(username: string, password: string, otp: string = '000000', rememberMe: boolean = false): Promise<void> {
    await this.login(username, password, rememberMe);
    await this.verifyOtp(otp);
  }

  /**
   * Wait for successful login (redirect to home page)
   */
  async waitForLoginSuccess(timeout: number = 10000): Promise<void> {
    await this.waitForUrlContains('/', timeout);
  }

  /**
   * Wait for toast notification
   */
  async waitForToast(timeout: number = 5000): Promise<string> {
    const toast = await this.waitForVisible(this.toastAlert, timeout);
    return await toast.getText();
  }

  /**
   * Check if error message is displayed for username
   */
  async hasUsernameError(): Promise<boolean> {
    return await this.elementExists(By.id('username-error'));
  }

  /**
   * Check if error message is displayed for password
   */
  async hasPasswordError(): Promise<boolean> {
    return await this.elementExists(By.id('password-error'));
  }

  /**
   * Get username error message
   */
  async getUsernameError(): Promise<string> {
    return await this.getText(By.id('username-error'));
  }

  /**
   * Get password error message
   */
  async getPasswordError(): Promise<string> {
    return await this.getText(By.id('password-error'));
  }

  /**
   * Click register link
   */
  async clickRegisterLink(): Promise<void> {
    await this.click(this.registerLink);
  }

  /**
   * Click forgot password link
   */
  async clickForgotPasswordLink(): Promise<void> {
    await this.click(this.forgotPasswordLink);
  }

  /**
   * Check if submit button is disabled
   */
  async isSubmitDisabled(): Promise<boolean> {
    return !(await this.isEnabled(this.submitButton));
  }
}
